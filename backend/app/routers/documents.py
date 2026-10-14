"""
Documents & Knowledge Base Router.

WHAT: Exposes /documents/upload, /documents, and /documents/{id} endpoints.
WHY: Handles file uploads, asynchronous ingestion pipeline scheduling,
     document listing, and cascade deletion of documents and chunks.
"""

import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse, DeleteDocumentResponse
from app.services.ingestion import process_document_ingestion
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/documents", tags=["Knowledge Base & Documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Uploads an enterprise document and triggers asynchronous background ingestion.

    WHAT:
    1. Validates file extension (.pdf, .docx, .txt).
    2. Persists file to local uploads directory.
    3. Creates Document record in database with status='Processing'.
    4. Enqueues background ingestion task (parsing -> chunking -> 768d embedding -> storage).
    5. Returns immediately with HTTP 201 and initial document metadata.

    WHY:
    Long-running PDF parsing and vector generation should not block HTTP worker threads
    or delay response delivery to the user interface.
    """
    filename = file.filename or "uploaded_document"
    ext = os.path.splitext(filename)[1].lower().replace(".", "")
    allowed_types = ["pdf", "docx", "txt", "text", "md"]

    if ext not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Supported formats: PDF, DOCX, TXT."
        )

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Generate unique document ID and file path
    doc_id = f"doc-{uuid.uuid4().hex[:6]}"
    stored_filename = f"{doc_id}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    # Save uploaded file stream to disk
    file_size = 0
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)

    # Categorize document based on filename heuristics
    category = "Legal / Contracts" if any(w in filename.lower() for w in ["agreement", "contract", "msa", "terms"]) \
        else "Security & Compliance" if any(w in filename.lower() for w in ["soc2", "security", "hipaa", "audit"]) \
        else "Clinical / Regulatory" if any(w in filename.lower() for w in ["clinical", "trial", "protocol", "health"]) \
        else "Human Resources" if any(w in filename.lower() for w in ["handbook", "policy", "employee", "conduct"]) \
        else "Enterprise Document"

    # Create Document DB record
    new_doc = Document(
        id=doc_id,
        user_id=current_user.id,
        name=filename,
        size=file_size,
        status="Processing",
        chunk_count=0,
        file_path=file_path,
        file_type=ext if ext != "text" else "txt",
        embedding_model="text-embedding-004 (768d)",
        category=category,
        summary="Document uploaded and queued for PyMuPDF parsing, chunking, and 768d vector indexing."
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Enqueue background ingestion pipeline
    background_tasks.add_task(
        process_document_ingestion,
        document_id=new_doc.id,
        file_path=file_path,
        file_type=ext
    )

    return DocumentResponse.model_validate(new_doc)


@router.get("", response_model=List[DocumentResponse], status_code=status.HTTP_200_OK)
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists all documents in the active knowledge base.
    WHAT: Queries Document records and serializes to match API_CONTRACT.md.
    WHY: Feeds the KnowledgeBase and Dashboard document tables in the frontend.
    """
    # Fetch all documents ordered by uploaded_at descending
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.delete("/{document_id}", response_model=DeleteDocumentResponse, status_code=status.HTTP_200_OK)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a document and purges its vector embeddings and chunk records.
    WHAT: Deletes Document entity (foreign key CASCADE deletes chunks) and removes file from disk.
    WHY: Frees storage and cleans vector search index when documents are removed.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found"
        )

    # Remove physical file on disk if exists
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            pass

    # Delete database record (cascades to all associated Chunk records)
    db.delete(doc)
    db.commit()

    return DeleteDocumentResponse(success=True, id=document_id)
