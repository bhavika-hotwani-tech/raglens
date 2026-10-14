"""
Document Pydantic Schemas.

WHAT: Defines serialization models for knowledge base document records and deletion responses.
WHY: Ensures JSON responses returned to the frontend match the exact field naming and shapes
     prescribed in API_CONTRACT.md (camelCase aliases for frontend compatibility).
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class DocumentResponse(BaseModel):
    """
    Representation of an ingested or processing document.
    Serializes to match API_CONTRACT.md exactly (camelCase keys).
    """
    id: str
    name: str
    type: str = Field(..., alias="file_type")
    size: int
    status: str
    chunks_count: int = Field(default=0, serialization_alias="chunksCount")
    embedding_model: str = Field(default="text-embedding-004 (768d)", serialization_alias="embeddingModel")
    uploaded_at: datetime = Field(..., serialization_alias="uploadedAt")
    category: str = Field(default="Enterprise Document")
    summary: Optional[str] = Field(default=None)

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )


class DeleteDocumentResponse(BaseModel):
    """Payload returned upon successful document deletion."""
    success: bool = True
    id: str
