"""
FastAPI Application Entry Point.

WHAT: Configures the FastAPI application, CORS middleware, database lifespan initialization,
     and route registration.
WHY: Serves as the central HTTP gateway, enabling secure cross-origin communication with
     the React frontend at http://localhost:5173 and providing auto-generated OpenAPI documentation.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers.auth import router as auth_router
from app.routers.documents import router as documents_router
from app.routers.chat import router as chat_router
from app.routers.stats import router as stats_router
from app.routers.evaluation import router as evaluation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    WHAT: Runs database initialization on startup.
    WHY: Automatically provisions the PostgreSQL 'vector' extension, creates tables,
         and establishes HNSW and GIN indexes before accepting client traffic.
    """
    print("[RAGLens Backend] Initializing database extensions, tables, and vector indexes...")
    try:
        init_db()
        print("[RAGLens Backend] Database successfully initialized with pgvector (768d) & GIN indexes.")
    except Exception as e:
        print(f"[RAGLens Backend Warning] Database initialization deferred: {e}")
        print("Ensure PostgreSQL with pgvector is running via 'docker compose up -d'.")
    yield


app = FastAPI(
    title="RAGLens Enterprise Backend API",
    description="Enterprise Advanced-RAG platform backend providing document ingestion, "
                "PyMuPDF parsing, Gemini 768d vector embeddings, and pgvector storage.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
# Allows frontend development server (http://localhost:5173 and http://127.0.0.1:5173) to communicate securely
origins = settings.cors_origins_list
for o in ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]:
    if o not in origins:
        origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers:
# Mount both at root AND at /api/v1 to seamlessly satisfy both API contract paths and frontend baseURL
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(stats_router)
app.include_router(evaluation_router)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1")
app.include_router(evaluation_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
def health_check():
    """
    Health check endpoint for liveness probes and status checks.
    """
    return {
        "status": "healthy",
        "service": "RAGLens Backend",
        "version": "1.0.0",
        "pgvector_dim": settings.EMBEDDING_DIMENSIONS
    }
