"""
Document ORM Model.

WHAT: Defines database table for uploaded files (PDF, DOCX, TXT) and their ingestion status.
WHY: Tracks document metadata (name, file size, status, chunk counts, category) and associates
     documents with the owning user and generated semantic chunks.
"""

import uuid
from sqlalchemy import Column, String, BigInteger, Integer, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    # Unique document identifier with prefix (e.g. 'doc-101')
    id = Column(
        String(64),
        primary_key=True,
        default=lambda: f"doc-{uuid.uuid4().hex[:6]}"
    )
    user_id = Column(
        String(64),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False)
    size = Column(BigInteger, nullable=False)
    # Status progression: Processing -> Indexed / Failed
    status = Column(String(50), default="Processing", index=True, nullable=False)
    chunk_count = Column(Integer, default=0, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # File storage & metadata details
    file_path = Column(String(500), nullable=True)
    file_type = Column(String(50), nullable=True)
    embedding_model = Column(String(100), default="text-embedding-004 (768d)", nullable=False)
    category = Column(String(100), default="Enterprise Document", nullable=False)
    summary = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="documents")
    # Deleting document automatically cascades to delete all child chunks
    chunks = relationship(
        "Chunk",
        back_populates="document",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
