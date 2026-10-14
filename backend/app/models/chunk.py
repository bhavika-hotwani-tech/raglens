"""
Chunk ORM Model.

WHAT: Defines database table storing semantic text passages, their 768d vector embeddings,
     and PostgreSQL TSVECTOR for hybrid dense + lexical retrieval.
WHY: Enables pgvector HNSW cosine similarity search and full-text keyword ranking
     grounded to specific document pages.
"""

import uuid
from sqlalchemy import Column, String, Integer, Text, ForeignKey, Computed
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.database import Base


class Chunk(Base):
    __tablename__ = "chunks"

    # Unique chunk identifier with prefix (e.g. 'chk-101-088')
    id = Column(
        String(64),
        primary_key=True,
        default=lambda: f"chk-{uuid.uuid4().hex[:8]}"
    )
    document_id = Column(
        String(64),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    # 1-indexed document page number where this chunk was extracted
    page_number = Column(Integer, nullable=False, default=1)
    # Positional sequence index of chunk within the document
    chunk_index = Column(Integer, nullable=False, default=0)
    # The actual extracted text passage (~600 tokens)
    content = Column(Text, nullable=False)

    # 768-dimensional dense vector embedding produced by Gemini text-embedding-004
    embedding = Column(Vector(768), nullable=False)

    # TSVECTOR for full-text keyword search, automatically indexed via GIN
    tsv = Column(
        TSVECTOR,
        Computed("to_tsvector('english', content)", persisted=True),
        nullable=True
    )

    # Relationship back to parent document
    document = relationship("Document", back_populates="chunks")
