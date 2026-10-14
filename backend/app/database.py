"""
Database Engine & Session Management Module.

WHAT: Configures SQLAlchemy 2.0 engine, sessionmaker, base model, and pgvector extension.
WHY: Provides database connection pooling, request-scoped sessions for FastAPI endpoints,
     and initialization hooks to enable the pgvector extension and indexes.
"""

from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

# Create SQLAlchemy 2.0 engine using psycopg 3 driver
# pool_pre_ping=True checks connection liveness before borrowing from the pool
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Thread-local session factory for database transactions
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

# Declarative base class for all ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a clean database session per request.
    Automatically closes session when request execution completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initializes database schema and required extensions.

    WHAT:
    1. Executes 'CREATE EXTENSION IF NOT EXISTS vector' to enable pgvector support.
    2. Creates all tables defined by SQLAlchemy ORM models.
    3. Verifies or creates HNSW index (cosine) on chunks.embedding and GIN index on chunks.tsv.

    WHY:
    Ensures the PostgreSQL instance is immediately ready for high-performance vector
    similarity search and full-text lexical ranking without manual DBA intervention.
    """
    with engine.begin() as conn:
        # Enable pgvector extension inside PostgreSQL
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))

    # Import all models so Base knows about all tables
    import app.models  # noqa: F401

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Ensure custom vector and full-text indexes exist
    with engine.begin() as conn:
        # HNSW index for sub-millisecond approximate nearest neighbor cosine search
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_chunks_embedding_hnsw
            ON chunks
            USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64);
        """))

        # GIN index for fast full-text lexical keyword search
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_chunks_tsv_gin
            ON chunks
            USING gin (tsv);
        """))
