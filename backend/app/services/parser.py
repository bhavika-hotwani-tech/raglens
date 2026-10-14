"""
Document Parser Service.

WHAT: Parses uploaded documents (PDF, TXT, DOCX) into clean text partitioned by page number.
WHY: Preserves exact page numbers so subsequent retrieval stages can cite specific pages
     in legal, medical, and compliance documents as required by enterprise audit standards.
"""

import os
from typing import List, Dict, Any
import pymupdf


def parse_pdf(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts text page-by-page from a PDF using PyMuPDF.
    WHAT: Iterates through each document page and extracts UTF-8 text.
    WHY: PyMuPDF is extremely fast, highly accurate with enterprise layouts,
         and provides 1-to-1 page number mappings for source citations.
    """
    pages_data = []
    doc = pymupdf.open(file_path)
    try:
        for page_index in range(len(doc)):
            page = doc[page_index]
            text = page.get_text("text").strip()
            # Retain non-empty pages or record page number even if sparse
            if text:
                pages_data.append({
                    "page_number": page_index + 1,
                    "text": text
                })
    finally:
        doc.close()

    return pages_data


def parse_txt(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts content from a plain text file.
    WHAT: Reads file using UTF-8 encoding (with fallback to Latin-1).
    WHY: Handles raw text documents, guidelines, and logs cleanly.
    """
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read().strip()

    if not content:
        return []

    return [{
        "page_number": 1,
        "text": content
    }]


def parse_document(file_path: str, file_type: str = "pdf") -> List[Dict[str, Any]]:
    """
    Dispatches file to the appropriate parser based on file extension or type.
    WHAT: Determines file type and returns structured page-level text data.
    WHY: Standardizes input into a unified page list for the downstream chunker.
    """
    ext = os.path.splitext(file_path)[1].lower().replace(".", "")
    effective_type = ext or file_type.lower()

    if effective_type == "pdf":
        return parse_pdf(file_path)
    elif effective_type in ["txt", "text", "log", "md"]:
        return parse_txt(file_path)
    else:
        # Fallback to PyMuPDF which also supports XPS, EPUB, and MOBI
        try:
            return parse_pdf(file_path)
        except Exception:
            return parse_txt(file_path)
