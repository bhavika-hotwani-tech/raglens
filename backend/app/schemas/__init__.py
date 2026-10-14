"""
Schemas package initialization.
"""

from app.schemas.auth import UserRegister, UserLogin, UserResponse, AuthResponse
from app.schemas.document import DocumentResponse, DeleteDocumentResponse

__all__ = [
    "UserRegister",
    "UserLogin",
    "UserResponse",
    "AuthResponse",
    "DocumentResponse",
    "DeleteDocumentResponse",
]
