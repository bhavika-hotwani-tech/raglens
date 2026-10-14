# RAGLens Enterprise API Specification & Contract

This document defines the RESTful and Server-Sent Events (SSE) contract for connecting the **RAGLens** frontend to an enterprise backend (e.g. FastAPI / Python or Node.js).

All responses follow standard HTTP semantics. Standard error responses return:
```json
{
  "detail": "Descriptive error message"
}
```

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new enterprise user account and returns a signed JWT.

- **Request Body:**
```json
{
  "name": "Sarah Chen",
  "email": "sarah.chen@enterprise.ai",
  "password": "SecurePassword123"
}
```

- **Response `201 Created`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-948f2a1b",
    "name": "Sarah Chen",
    "email": "sarah.chen@enterprise.ai",
    "role": "Lead AI & Retrieval Engineer",
    "organization": "Acme Global Defense & Health AI",
    "avatarUrl": null
  }
}
```

---

### `POST /auth/login`
Authenticates user credentials and issues an access token.

- **Request Body:**
```json
{
  "email": "sarah.chen@enterprise.ai",
  "password": "password123"
}
```

- **Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-enterprise-01",
    "name": "Sarah Chen",
    "email": "sarah.chen@enterprise.ai",
    "role": "Lead AI & Retrieval Engineer",
    "organization": "Acme Global Defense & Health AI",
    "avatarUrl": null
  }
}
```

---

### `GET /auth/me`
Fetches authenticated user identity from the request Bearer token.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "id": "usr-enterprise-01",
  "name": "Sarah Chen",
  "email": "sarah.chen@enterprise.ai",
  "role": "Lead AI & Retrieval Engineer",
  "organization": "Acme Global Defense & Health AI",
  "avatarUrl": null
}
```

---

## 2. Knowledge Base & Document Endpoints

### `POST /documents/upload`
Uploads an unstructured file (`.pdf`, `.docx`, `.txt`) for text extraction, chunking, and vector embedding.

- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:**
  - `file`: Binary file upload
- **Response `201 Created`:**
```json
{
  "id": "doc-109",
  "name": "Disaster_Recovery_Protocol_2025.pdf",
  "type": "pdf",
  "size": 2411724,
  "status": "Indexed",
  "chunksCount": 134,
  "embeddingModel": "text-embedding-3-large (3072d)",
  "uploadedAt": "2025-05-28T18:02:00Z",
  "category": "DevOps / Engineering",
  "summary": "Extracted and indexed 134 semantic chunks with Dense + BM25 indices."
}
```

---

### `GET /documents`
Lists all documents in the active knowledge base.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
[
  {
    "id": "doc-101",
    "name": "Master_Services_Agreement_Acme_Enterprise_2025.pdf",
    "type": "pdf",
    "size": 4404019,
    "status": "Indexed",
    "chunksCount": 184,
    "embeddingModel": "text-embedding-3-large (3072d)",
    "uploadedAt": "2025-05-12T10:14:00Z",
    "category": "Legal / Contracts",
    "summary": "Master enterprise software license agreement covering terms of service, SLA guarantees, data liability caps, and indemnification exclusions."
  }
]
```

---

### `DELETE /documents/{id}`
Removes a document and purges its vector embeddings and chunk records from the database.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "success": true,
  "id": "doc-101"
}
```

---

## 3. Grounded Chat & Citation Endpoints

### `POST /chat` (Server-Sent Events Streaming)
Executes a multi-stage grounded retrieval pipeline and streams the generated response and pipeline telemetry.

- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: text/event-stream`
- **Request Body:**
```json
{
  "conversationId": "conv-1",
  "message": "What are the mutual indemnification limits in the Acme MSA?",
  "settings": {
    "topK": 5,
    "similarityThreshold": 0.70,
    "reranker": true,
    "hybridSearch": true,
    "selfCorrection": true,
    "maxRetries": 2
  }
}
```

- **SSE Event Stream Format:**
```
data: {"type": "step", "data": {"step": "Query Rewrite", "status": "Passed", "latencyMs": 18, "details": "Expanded query acronyms"}}

data: {"type": "step", "data": {"step": "Multi-Query Expansion", "status": "Passed", "latencyMs": 34, "details": "Generated 3 sub-queries"}}

data: {"type": "step", "data": {"step": "Hybrid Retrieval (Dense + BM25)", "status": "Passed", "latencyMs": 64, "details": "Retrieved 40 candidates"}}

data: {"type": "step", "data": {"step": "Cross-Encoder Rerank", "status": "Passed", "latencyMs": 42, "details": "Model: BAAI/bge-reranker-large"}}

data: {"type": "token", "data": "Based "}
data: {"type": "token", "data": "on Section 11.2 of the "}
data: {"type": "token", "data": "Master Services Agreement..."}

data: {"type": "complete", "data": {
  "id": "msg-82a1f0",
  "role": "assistant",
  "content": "Based on Section 11.2...",
  "timestamp": "2025-05-28T14:43:12Z",
  "sources": [
    {
      "id": "src-1",
      "docId": "doc-101",
      "docName": "Master_Services_Agreement_Acme_Enterprise_2025.pdf",
      "page": 24,
      "chunkId": "chk-101-088",
      "score": 0.96,
      "text": "Section 11.2 Aggregate Liability..."
    }
  ],
  "pipelineTrace": [
    { "step": "Query Rewrite", "status": "Passed", "latencyMs": 18, "details": "..." },
    { "step": "Multi-Query Expansion", "status": "Passed", "latencyMs": 34, "details": "..." },
    { "step": "Hybrid Retrieval (Dense + BM25)", "status": "Passed", "latencyMs": 64, "details": "..." },
    { "step": "Cross-Encoder Rerank", "status": "Passed", "latencyMs": 42, "details": "..." },
    { "step": "Context Generation", "status": "Passed", "latencyMs": 215, "details": "..." },
    { "step": "Self-Correction & Faithfulness Check", "status": "Passed", "latencyMs": 31, "details": "..." }
  ]
}}

data: [DONE]
```

---

### `GET /conversations`
Fetches all stored conversation threads for the authenticated user.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
[
  {
    "id": "conv-1",
    "title": "Acme MSA Indemnification & Liability Caps",
    "updatedAt": "2025-05-28T14:45:00Z",
    "messagesCount": 4,
    "preview": "What are the mutual indemnification limits and carve-outs in the Acme MSA?"
  }
]
```

---

### `GET /conversations/{id}`
Fetches message history and citations for a conversation thread.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "id": "conv-1",
  "title": "Acme MSA Indemnification & Liability Caps",
  "updatedAt": "2025-05-28T14:45:00Z",
  "messagesCount": 2,
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "What are the mutual indemnification limits?",
      "timestamp": "2025-05-28T14:43:10Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Based on Section 11.2...",
      "timestamp": "2025-05-28T14:43:12Z",
      "sources": [],
      "pipelineTrace": []
    }
  ]
}
```

---

### `POST /feedback`
Submits user feedback rating (thumbs up / thumbs down) for citation audit logs.

- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "messageId": "msg-2",
  "rating": "up",
  "comment": "Accurate grounding"
}
```

- **Response `200 OK`:**
```json
{
  "success": true,
  "messageId": "msg-2",
  "rating": "up"
}
```

---

## 4. Evaluation Suite Endpoints

### `GET /evaluation/results`
Returns benchmark evaluation metrics comparing Naive RAG to Advanced RAG.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "summary": {
    "totalTestCases": 250,
    "evaluatedDate": "2025-05-28T12:00:00Z",
    "datasetName": "Enterprise-Legal-Medical-Benchmark-v2.4",
    "evaluatorModel": "gpt-4o-evaluator (RAGAS & TruLens criteria)"
  },
  "comparison": [
    {
      "metric": "Faithfulness",
      "description": "Measures factual grounding: percent of claims in answer directly supported by context.",
      "naive": 0.714,
      "advanced": 0.962,
      "delta": 0.248,
      "direction": "higher",
      "unit": "%"
    }
  ],
  "chartData": [
    { "name": "Faithfulness", "Naive": 71.4, "Advanced": 96.2 }
  ],
  "latencyBreakdown": [
    { "step": "Query Rewrite", "ms": 18 },
    { "step": "Multi-Query", "ms": 34 }
  ]
}
```

---

### `POST /evaluation/run`
Triggers an automated batch evaluation run across the test dataset.

- **Headers:** `Authorization: Bearer <token>`
- **Response `202 Accepted`:**
```json
{
  "jobId": "eval-run-948",
  "status": "Running",
  "estimatedCompletionSeconds": 15
}
```

---

## 5. Telemetry & Stats Endpoints

### `GET /stats`
Returns system dashboard telemetry, vector storage metrics, and 7-day query volumes.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "totalDocuments": 8,
  "totalChunks": 14820,
  "queriesToday": 1429,
  "avgFaithfulness": 0.964,
  "statsDeltas": {
    "documents": "+2 added this week",
    "chunks": "+1,240 new vectors",
    "queries": "+18.4% vs yesterday",
    "faithfulness": "+4.2% vs baseline"
  },
  "queriesChart": [
    { "date": "Mon", "queries": 820, "avgLatency": 420 },
    { "date": "Sun", "queries": 1429, "avgLatency": 410 }
  ],
  "systemHealth": {
    "vectorStore": { "status": "Healthy", "provider": "Qdrant Distributed Clustered", "latency": "14ms" },
    "reranker": { "status": "Operational", "model": "BAAI/bge-reranker-large", "p99": "44ms" }
  },
  "recentActivity": []
}
```
