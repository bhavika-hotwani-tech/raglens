"""
Document Chunking Service.

WHAT: Splits page text into semantic passages of ~600 tokens with 100 tokens overlap,
     preserving the page_number metadata on every chunk.
WHY: Dense embeddings capture semantic nuance best within 500-800 token windows.
     The 100-token sliding overlap prevents truncation of cross-sentence reasoning,
     and retaining the page number enables precise citations in the frontend.
"""

from typing import List, Dict, Any


def estimate_tokens(text: str) -> int:
    """
    Approximates token count for English text (1 token ≈ 0.75 words or ~4 characters).
    WHAT: Computes token heuristic based on whitespace word splits.
    WHY: Fast, deterministic token estimation without requiring heavy tokenizer downloads.
    """
    words = text.split()
    return int(len(words) / 0.75)


def chunk_text_with_overlap(
    text: str,
    page_number: int,
    start_chunk_index: int,
    target_tokens: int = 600,
    overlap_tokens: int = 100
) -> List[Dict[str, Any]]:
    """
    Splits text from a single page into overlapping chunk windows.

    WHAT:
    - Converts token targets into word counts (target ≈ 450 words, overlap ≈ 75 words).
    - Advances sliding window across words, preserving continuity.

    WHY:
    Ensures that context surrounding critical phrases (such as liability clauses or medical criteria)
    is not split across disconnected chunks without shared context.
    """
    words = text.split()
    if not words:
        return []

    # 600 tokens ≈ 450 words, 100 overlap ≈ 75 words
    target_words = int(target_tokens * 0.75)
    overlap_words = int(overlap_tokens * 0.75)
    step_size = max(1, target_words - overlap_words)

    chunks = []
    current_idx = start_chunk_index

    # If the page content is already smaller than target size, emit as a single chunk
    if len(words) <= target_words:
        chunks.append({
            "page_number": page_number,
            "chunk_index": current_idx,
            "content": " ".join(words)
        })
        return chunks

    # Sliding window slicing
    for i in range(0, len(words), step_size):
        chunk_words = words[i: i + target_words]
        if not chunk_words:
            break

        chunk_content = " ".join(chunk_words)
        chunks.append({
            "page_number": page_number,
            "chunk_index": current_idx,
            "content": chunk_content
        })
        current_idx += 1

        # Stop if we reached the end of the page's word list
        if i + target_words >= len(words):
            break

    return chunks


def chunk_pages(
    pages_data: List[Dict[str, Any]],
    target_tokens: int = 600,
    overlap_tokens: int = 100
) -> List[Dict[str, Any]]:
    """
    Iterates through all document pages and produces an ordered list of chunks.

    WHAT:
    Calls chunk_text_with_overlap page by page and maintains a continuous global chunk_index.

    WHY:
    Ensures each chunk retains its source page number while maintaining strict document order.
    """
    all_chunks = []
    current_chunk_index = 0

    for page_item in pages_data:
        page_num = page_item["page_number"]
        page_text = page_item["text"]

        page_chunks = chunk_text_with_overlap(
            text=page_text,
            page_number=page_num,
            start_chunk_index=current_chunk_index,
            target_tokens=target_tokens,
            overlap_tokens=overlap_tokens
        )

        all_chunks.extend(page_chunks)
        current_chunk_index += len(page_chunks)

    return all_chunks
