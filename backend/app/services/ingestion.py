"""
Document Ingestion Background Task Orchestrator.

WHAT: Executes the end-to-end ingestion pipeline asynchronously in the background.
WHY: Parsing multi-page PDFs, chunking text, and embedding dozens of passages can take
     several seconds. Running this in a FastAPI BackgroundTask allows the upload endpoint
     to return HTTP 201 immediately with status="Processing" so the UI remains fast.
"""

import traceback
from app.database import SessionLocal
from app.models.document import Document
from app.models.chunk import Chunk
from app.services.parser import parse_document
from app.services.chunker import chunk_pages
from app.services.embedder import embed_documents


def process_document_ingestion(document_id: str, file_path: str, file_type: str = "pdf") -> None:
    """
    Background worker function that transforms raw files into indexed semantic chunks.

    PIPELINE STAGES:
    1. Parse file into pages using PyMuPDF.
    2. Split page texts into ~600 token passages with 100 token overlap.
    3. Generate 768-dimensional vector embeddings via Gemini gemini-embedding-001.
    4. Store chunks with TSVECTOR full-text indexes in PostgreSQL.
    5. Update document status to 'Indexed' (or 'Failed' on unexpected error).
    """
    db = SessionLocal()
    try:
        # 1. Fetch document record to ensure it exists
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            print(f"[Ingestion Error] Document {document_id} not found in database.")
            return

        # 2. Parse document page by page
        pages_data = parse_document(file_path=file_path, file_type=file_type)
        if not pages_data:
            doc.status = "Failed"
            doc.summary = "Unable to extract readable text from document. Check file format or scan resolution."
            db.commit()
            return

        # 3. Chunk text into ~600 token passages with 100 overlap
        chunks_data = chunk_pages(pages_data, target_tokens=600, overlap_tokens=100)
        if not chunks_data:
            doc.status = "Failed"
            doc.summary = "No valid text content found after parsing pages."
            db.commit()
            return

        # 4. Batch embed chunk contents using Gemini gemini-embedding-001 (RETRIEVAL_DOCUMENT, 768d)
        # WHAT: Generate 768-dimensional L2-normalized embeddings via embed_documents
        # WHY: Documents must be embedded with RETRIEVAL_DOCUMENT task type for accurate vector retrieval
        contents = [c["content"] for c in chunks_data]
        embeddings = embed_documents(contents, batch_size=32)

        # 5. Create Chunk records and insert into PostgreSQL
        chunk_models = []
        for i, chunk_dict in enumerate(chunks_data):
            chunk_obj = Chunk(
                document_id=document_id,
                page_number=chunk_dict["page_number"],
                chunk_index=chunk_dict["chunk_index"],
                content=chunk_dict["content"],
                embedding=embeddings[i]
            )
            chunk_models.append(chunk_obj)

        db.bulk_save_objects(chunk_models)

        # 6. Mark document as successfully Indexed
        doc.status = "Indexed"
        doc.chunk_count = len(chunk_models)
        doc.summary = f"Extracted {len(pages_data)} pages and indexed {len(chunk_models)} semantic chunks with Dense (768d) + BM25 indices."
        db.commit()
        print(f"[Ingestion Success] Document {document_id} ({doc.name}) successfully indexed with {len(chunk_models)} chunks.")

    except Exception as e:
        db.rollback()
        error_msg = str(e)
        traceback.print_exc()

        # Update document to 'Failed' state so the frontend shows failure alert
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.status = "Failed"
                doc.summary = f"Ingestion error: {error_msg[:250]}"
                db.commit()
        except Exception:
            pass

    finally:
        db.close()
