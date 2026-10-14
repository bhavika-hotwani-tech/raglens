# RAGLens Enterprise Backend

> High-performance FastAPI backend for RAGLens, featuring PostgreSQL + pgvector, PyMuPDF page-by-page parsing, 768-dimensional Gemini vector embeddings, and background ingestion tasks.

---

## 🏗️ Architecture & Features

- **FastAPI & Python 3.11+**: High-throughput REST API strictly implementing [`API_CONTRACT.md`](../API_CONTRACT.md).
- **PostgreSQL 16 + pgvector**: Native vector similarity search via `pgvector.sqlalchemy.Vector(768)`.
- **HNSW & GIN Indexes**: Sub-millisecond cosine vector retrieval (`hnsw`) and full-text keyword search (`gin` on TSVECTOR).
- **PyMuPDF (`fitz`)**: Fast page-by-page document parsing preserving 1-indexed `page_number` metadata.
- **Intelligent Chunker**: ~600 tokens target window with 100 token sliding overlap.
- **Gemini Embeddings**: Batched vector generation with 768 dimensions using `text-embedding-004`.
- **Stateless JWT Security**: Passwords hashed with `bcrypt`, signed tokens with `python-jose`.
- **Asynchronous Ingestion**: Runs chunking, embedding, and storage in FastAPI `BackgroundTasks`.

---

## ⚡ Quick Start & Run Instructions

### 1. Start PostgreSQL with pgvector

Ensure Docker is running, then run:

```bash
cd D:\raglens\backend
docker compose up -d
```

This launches a PostgreSQL 16 container with the `vector` extension pre-installed on port `5432`.

### 2. Set Up Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate on Windows PowerShell
.\venv\Scripts\Activate.ps1
# Or in Command Prompt:
# .\venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Open `D:\raglens\backend\.env` and add your Google Gemini API key:

```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/raglens
JWT_SECRET_KEY=raglens-enterprise-secret-key-change-in-production-948f2a1b
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

*(Note: If `GEMINI_API_KEY` is omitted, the embedder automatically falls back to normalized unit vectors so you can still test full database ingestion and HNSW indexing offline.)*

### 4. Launch the FastAPI Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The database tables, pgvector extension, HNSW index, and GIN index will be initialized automatically on server boot!

- **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Step-by-Step API Testing Guide

### 1. Register a New User (`POST /auth/register`)

```bash
curl -X POST "http://localhost:8000/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Sarah Chen\", \"email\": \"sarah.chen@enterprise.ai\", \"password\": \"password123\"}"
```

**Expected Response (`201 Created`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-8a2f4c1d",
    "name": "Sarah Chen",
    "email": "sarah.chen@enterprise.ai",
    "role": "Lead AI & Retrieval Engineer",
    "organization": "Acme Global Defense & Health AI",
    "avatarUrl": null
  }
}
```

---

### 2. Login to Obtain JWT Token (`POST /auth/login`)

```bash
curl -X POST "http://localhost:8000/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"sarah.chen@enterprise.ai\", \"password\": \"password123\"}"
```

Save the returned token into an environment variable:
```bash
set TOKEN=your_jwt_token_here
```

---

### 3. Verify Identity (`GET /auth/me`)

```bash
curl -X GET "http://localhost:8000/auth/me" ^
  -H "Authorization: Bearer %TOKEN%"
```

---

### 4. Upload & Ingest a Document (`POST /documents/upload`)

```bash
curl -X POST "http://localhost:8000/documents/upload" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -F "file=@test_agreement.pdf"
```

**Expected Response (`201 Created`):**
```json
{
  "id": "doc-a1f94c",
  "name": "test_agreement.pdf",
  "type": "pdf",
  "size": 420184,
  "status": "Processing",
  "chunksCount": 0,
  "embeddingModel": "text-embedding-004 (768d)",
  "uploadedAt": "2026-10-04T12:00:00Z",
  "category": "Legal / Contracts",
  "summary": "Document uploaded and queued for PyMuPDF parsing, chunking, and 768d vector indexing."
}
```

*The background worker will parse each page, chunk into ~600 tokens (100 overlap), embed in batches with Gemini 768d, store in `chunks`, and update the status from `Processing` to `Indexed`.*

---

### 5. List Ingested Documents (`GET /documents`)

```bash
curl -X GET "http://localhost:8000/documents" ^
  -H "Authorization: Bearer %TOKEN%"
```

Once background processing finishes, `status` displays `"Indexed"` with the populated `chunksCount`.

---

### 6. Delete a Document & Purge Chunks (`DELETE /documents/{id}`)

```bash
curl -X DELETE "http://localhost:8000/documents/doc-a1f94c" ^
  -H "Authorization: Bearer %TOKEN%"
```

**Expected Response (`200 OK`):**
```json
{
  "success": true,
  "id": "doc-a1f94c"
}
```

---

## 🗄️ Database Inspection in PostgreSQL

To verify pgvector and generated indexes directly in PostgreSQL:

```bash
docker exec -it raglens-postgres psql -U postgres -d raglens
```

```sql
-- Verify vector extension
\dx

-- Verify table schemas
\d chunks
\d documents

-- Verify HNSW and GIN indexes
\di

-- Inspect chunks and 768d vector embeddings
SELECT id, document_id, page_number, chunk_index, length(content) as content_len FROM chunks LIMIT 5;
```
