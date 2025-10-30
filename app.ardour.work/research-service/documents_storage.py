"""
Simple file-based document storage for research reports
Uses JSON files to persist documents
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Storage directory
DOCUMENTS_DIR = Path("/app/data/documents")
DOCUMENTS_INDEX_FILE = DOCUMENTS_DIR / "index.json"

# Ensure storage directory exists
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)


def _load_index() -> Dict[str, Dict]:
    """Load the document index from disk"""
    if not DOCUMENTS_INDEX_FILE.exists():
        return {}

    try:
        with open(DOCUMENTS_INDEX_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load document index: {e}")
        return {}


def _save_index(index: Dict[str, Dict]):
    """Save the document index to disk"""
    try:
        with open(DOCUMENTS_INDEX_FILE, 'w', encoding='utf-8') as f:
            json.dump(index, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Failed to save document index: {e}")
        raise


def save_document(
    document_id: str,
    title: str,
    content: str,
    metadata: Optional[Dict] = None
) -> Dict:
    """
    Save a document to storage

    Args:
        document_id: Unique document identifier
        title: Document title
        content: Document content (markdown)
        metadata: Optional metadata (query, sources, etc.)

    Returns:
        Document object with metadata
    """
    # Create document object
    document = {
        "id": document_id,
        "title": title,
        "content": content,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
        "metadata": metadata or {}
    }

    # Save document content to file
    doc_file = DOCUMENTS_DIR / f"{document_id}.json"
    try:
        with open(doc_file, 'w', encoding='utf-8') as f:
            json.dump(document, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Failed to save document {document_id}: {e}")
        raise

    # Update index
    index = _load_index()
    index[document_id] = {
        "id": document_id,
        "title": title,
        "createdAt": document["createdAt"],
        "updatedAt": document["updatedAt"],
        "metadata": metadata or {}
    }
    _save_index(index)

    logger.info(f"Saved document: {document_id} - {title}")
    return document


def list_documents() -> List[Dict]:
    """
    List all documents (metadata only)

    Returns:
        List of document metadata objects
    """
    index = _load_index()
    documents = list(index.values())

    # Sort by creation date (newest first)
    documents.sort(key=lambda x: x.get('createdAt', ''), reverse=True)

    return documents


def get_document(document_id: str) -> Optional[Dict]:
    """
    Get a document by ID (full content)

    Args:
        document_id: Document identifier

    Returns:
        Document object with content, or None if not found
    """
    doc_file = DOCUMENTS_DIR / f"{document_id}.json"

    if not doc_file.exists():
        logger.warning(f"Document not found: {document_id}")
        return None

    try:
        with open(doc_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load document {document_id}: {e}")
        return None


def delete_document(document_id: str) -> bool:
    """
    Delete a document

    Args:
        document_id: Document identifier

    Returns:
        True if deleted, False if not found
    """
    doc_file = DOCUMENTS_DIR / f"{document_id}.json"

    if not doc_file.exists():
        return False

    try:
        # Remove from index
        index = _load_index()
        if document_id in index:
            del index[document_id]
            _save_index(index)

        # Delete file
        doc_file.unlink()

        logger.info(f"Deleted document: {document_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete document {document_id}: {e}")
        raise


def update_document(
    document_id: str,
    title: Optional[str] = None,
    content: Optional[str] = None,
    metadata: Optional[Dict] = None
) -> Optional[Dict]:
    """
    Update a document

    Args:
        document_id: Document identifier
        title: New title (optional)
        content: New content (optional)
        metadata: New metadata (optional)

    Returns:
        Updated document object, or None if not found
    """
    document = get_document(document_id)
    if not document:
        return None

    # Update fields
    if title is not None:
        document["title"] = title
    if content is not None:
        document["content"] = content
    if metadata is not None:
        document["metadata"] = metadata

    document["updatedAt"] = datetime.utcnow().isoformat()

    # Save updated document
    doc_file = DOCUMENTS_DIR / f"{document_id}.json"
    try:
        with open(doc_file, 'w', encoding='utf-8') as f:
            json.dump(document, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Failed to update document {document_id}: {e}")
        raise

    # Update index
    index = _load_index()
    index[document_id] = {
        "id": document_id,
        "title": document["title"],
        "createdAt": document["createdAt"],
        "updatedAt": document["updatedAt"],
        "metadata": document.get("metadata", {})
    }
    _save_index(index)

    logger.info(f"Updated document: {document_id}")
    return document
