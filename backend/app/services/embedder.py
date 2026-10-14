"""
Gemini Vector Embedding Service.

WHAT: Generates 768-dimensional dense vector embeddings using Google's gemini-embedding-001 model.
WHY: Dense embeddings capture deep semantic meanings for hybrid vector retrieval.
     Batching API calls minimizes network latency, respects Google rate limits,
     and the 768-dimension vectors match the HNSW vector(768) column in PostgreSQL.
"""

import math
import time
from typing import List
import httpx
from app.config import settings


def _l2_normalize(vector: List[float]) -> List[float]:
    """
    Normalizes a vector to unit length (L2 norm = 1.0).

    WHAT: Divides each vector component by Euclidean norm.
    WHY: Required for cosine similarity and MRL embeddings after truncation
         per Google Gemini documentation (ai.google.dev/gemini-api/docs/embeddings).
    """
    norm = math.sqrt(sum(x * x for x in vector))
    if norm == 0.0 or math.isnan(norm):
        return vector
    return [x / norm for x in vector]


def embed_batch_via_rest(
    texts: List[str],
    api_key: str,
    task_type: str = "RETRIEVAL_DOCUMENT",
    output_dimensionality: int = 768,
    dim: int = None
) -> List[List[float]]:
    """
    Calls Google Gemini REST API directly using httpx with exponential backoff retry.

    WHAT:
    - Sends batchEmbedContents request to models/gemini-embedding-001.
    - Specifies taskType (RETRIEVAL_DOCUMENT or RETRIEVAL_QUERY) and outputDimensionality=768.
    - Retries on API errors (HTTP 429 rate limit or 5xx server errors) up to 3 tries with exponential backoff.
    - Validates that returned vector lengths are strictly 768 (raises ValueError otherwise; zero-padding removed).
    - L2-normalizes every returned vector.

    WHY:
    - Verified parameter names: Google's REST API specification uses camelCase 'outputDimensionality'
      and 'taskType' in EmbedContentRequest (corresponding to Python SDK 'output_dimensionality' and 'task_type').
    - Exponential backoff gracefully handles transient 429 rate limits or upstream 5xx outages.
    - Refusing to pad or fabricate vectors preserves database index integrity and exposes actual API faults.
    """
    if dim is not None:
        output_dimensionality = dim

    # WHAT: Resolve model name from environment or config, defaulting to gemini-embedding-001
    # WHY: Ensures gemini-embedding-001 replaces legacy text-embedding-004 everywhere
    model_name = getattr(settings, "EMBEDDING_MODEL", None) or getattr(settings, "GEMINI_EMBEDDING_MODEL", None) or "gemini-embedding-001"
    model_id = model_name[len("models/"):] if model_name.startswith("models/") else model_name
    model_path = f"models/{model_id}"

    url = f"https://generativelanguage.googleapis.com/v1beta/{model_path}:batchEmbedContents?key={api_key}"

    # WHAT: Construct batch payload with verified REST parameters taskType and outputDimensionality
    # WHY: Matches Google Gemini REST API schema per ai.google.dev/gemini-api/docs/embeddings
    requests_payload = [
        {
            "model": model_path,
            "content": {"parts": [{"text": t}]},
            "taskType": task_type,
            "outputDimensionality": output_dimensionality
        }
        for t in texts
    ]

    payload = {"requests": requests_payload}

    max_tries = 3
    initial_backoff = 1.0  # seconds
    backoff_factor = 2.0

    data = None
    for attempt in range(1, max_tries + 1):
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(url, json=payload)

            # WHAT: Check for retryable HTTP errors (429 Too Many Requests or 5xx Server Errors)
            # WHY: Handles transient rate limits and Google server downtime with exponential backoff
            if response.status_code == 429 or 500 <= response.status_code < 600:
                if attempt == max_tries:
                    # WHAT: On final attempt exhaustion, raise HTTPStatusError
                    # WHY: Allows caller (e.g. ingestion pipeline) to mark document Failed and log the real error
                    response.raise_for_status()

                sleep_sec = initial_backoff * (backoff_factor ** (attempt - 1))
                retry_after = response.headers.get("Retry-After")
                if retry_after and retry_after.isdigit():
                    sleep_sec = max(sleep_sec, float(retry_after))

                time.sleep(sleep_sec)
                continue

            # WHAT: Raise immediately for non-retryable 4xx errors (e.g. 400 Bad Request, 401/403 Invalid Key)
            # WHY: Fail-fast on deterministic client authentication/syntax errors
            response.raise_for_status()
            data = response.json()
            break

        except (httpx.TimeoutException, httpx.NetworkError) as net_err:
            # WHAT: Retry transient network timeouts or connection drops
            # WHY: Provides fault tolerance against network blips before failing
            if attempt == max_tries:
                raise RuntimeError(
                    f"Gemini API network failure after {max_tries} attempts: {net_err}"
                ) from net_err

            sleep_sec = initial_backoff * (backoff_factor ** (attempt - 1))
            time.sleep(sleep_sec)

    if not data or "embeddings" not in data:
        raise ValueError(f"Gemini API returned invalid response without 'embeddings': {data}")

    embeddings = []
    for item in data.get("embeddings", []):
        values = item.get("values", [])

        # WHAT: Strictly validate returned vector dimension against target output_dimensionality
        # WHY: Zero-padding logic is completely removed. Never pad or fabricate vectors; raise ValueError.
        if len(values) != output_dimensionality:
            raise ValueError(
                f"Embedding vector dimension mismatch: expected exactly {output_dimensionality}, "
                f"but received {len(values)}. Zero-padding and vector fabrication are strictly prohibited."
            )

        # WHAT: L2-normalize every returned vector after receiving it
        # WHY: Ensures unit length for cosine similarity in pgvector
        embeddings.append(_l2_normalize(values))

    if len(embeddings) != len(texts):
        raise ValueError(
            f"Embedding count mismatch: expected {len(texts)} embeddings for batch, "
            f"received {len(embeddings)}."
        )

    return embeddings


def embed_documents(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """
    Embeds a list of document passages in batches using Gemini gemini-embedding-001.

    WHAT:
    - Splits text list into batches of size 'batch_size' (default 32).
    - Calls Gemini API with task_type RETRIEVAL_DOCUMENT and outputDimensionality=768.
    - L2-normalizes every returned vector.
    - Validates that returned vector lengths are strictly 768 (raises ValueError otherwise).
    - Retries 429/5xx errors 3 times with exponential backoff, then raises so caller marks document Failed.

    WHY:
    - RETRIEVAL_DOCUMENT optimizes embeddings for text passages stored in a searchable corpus.
    - Batching respects rate limits and optimizes network round-trips.
    """
    if not texts:
        return []

    target_dim = getattr(settings, "EMBEDDING_DIMENSIONS", 768)
    api_key = (getattr(settings, "GEMINI_API_KEY", "") or "").strip()

    # WHAT: Validate API key presence
    # WHY: Never fabricate fallback vectors; fail clearly if credentials are missing
    if not api_key or api_key.startswith("your_"):
        raise ValueError(
            "GEMINI_API_KEY is not configured. Real embeddings cannot be generated without a valid Gemini API key."
        )

    all_embeddings: List[List[float]] = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i: i + batch_size]
        batch_vectors = embed_batch_via_rest(
            texts=batch,
            api_key=api_key,
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=target_dim,
        )
        all_embeddings.extend(batch_vectors)

    return all_embeddings


def embed_query(text: str) -> List[float]:
    """
    Embeds a single query string using Gemini gemini-embedding-001.

    WHAT:
    - Calls Gemini API with task_type RETRIEVAL_QUERY and outputDimensionality=768.
    - L2-normalizes the returned vector.
    - Validates exact 768d dimension (raises ValueError on mismatch).
    - Retries 429/5xx errors 3 times with exponential backoff before raising.

    WHY:
    - RETRIEVAL_QUERY optimizes embeddings for search queries to match document chunks in vector search.
    """
    if not isinstance(text, str):
        raise TypeError(f"Query text must be a string, got {type(text).__name__}.")

    target_dim = getattr(settings, "EMBEDDING_DIMENSIONS", 768)
    api_key = (getattr(settings, "GEMINI_API_KEY", "") or "").strip()

    if not api_key or api_key.startswith("your_"):
        raise ValueError(
            "GEMINI_API_KEY is not configured. Real embeddings cannot be generated without a valid Gemini API key."
        )

    vectors = embed_batch_via_rest(
        texts=[text],
        api_key=api_key,
        task_type="RETRIEVAL_QUERY",
        output_dimensionality=target_dim,
    )

    if not vectors:
        raise ValueError("No embedding returned for query text.")

    return vectors[0]


def embed_texts(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """
    Backward-compatibility wrapper for embed_documents.

    WHAT: Routes calls to embed_documents with batch_size 32.
    WHY: Preserves compatibility for callers expecting the legacy embed_texts function.
    """
    return embed_documents(texts=texts, batch_size=batch_size)
