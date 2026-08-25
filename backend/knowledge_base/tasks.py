"""Background tasks for processing uploaded documents: extract text per page, compute embeddings, and store chunks."""
from __future__ import annotations
import traceback
import os
from celery import shared_task

try:
    import fitz  # pymupdf
except Exception:
    fitz = None

from sentence_transformers import SentenceTransformer
from django.conf import settings

from .models import Document, DocumentChunk


@shared_task(bind=True)
def process_document_task(self, document_id: int) -> dict:
    """Process an uploaded document:
    - update status to 'processing'
    - extract text page-by-page
    - compute embeddings and store DocumentChunk objects
    - set status to 'completed' (or 'failed' on error)

    Returns a dict with result status for debugging.
    """
    try:
        doc = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return {"status": "error", "message": f"Document {document_id} does not exist"}

    try:
        doc.status = 'processing'
        doc.save()

        if not doc.file or not os.path.exists(doc.file.path):
            raise FileNotFoundError(f"File for document {document_id} not found: {getattr(doc.file, 'path', None)}")

        if fitz is None:
            raise RuntimeError("pymupdf (fitz) is not available; install pymupdf to extract PDF text")

        # Lazy-load the embedding model to avoid heavy import at worker startup
        model = SentenceTransformer('paraphrase-MiniLM-L3-v2')

        pdf = fitz.open(doc.file.path)
        for page_number in range(len(pdf)):
            page = pdf.load_page(page_number)
            text = page.get_text("text")
            if not text or not text.strip():
                continue

            embedding = model.encode(text).tolist()

            DocumentChunk.objects.create(
                document=doc,
                page_number=page_number + 1,
                text_content=text,
                embedding=embedding,
            )

        pdf.close()

        doc.status = 'completed'
        doc.save()

        return {"status": "ok", "document_id": document_id}

    except Exception as exc:
        # Log and mark document failed
        tb = traceback.format_exc()
        try:
            doc.status = 'failed'
            doc.save()
        except Exception:
            pass
        # Re-raise if desired, or return the error details for inspectability
        return {"status": "failed", "error": str(exc), "traceback": tb}
