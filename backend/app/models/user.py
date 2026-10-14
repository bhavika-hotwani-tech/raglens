"""
User ORM Model.

WHAT: Defines database table for enterprise user accounts and credentials.
WHY: Stores identity, role, organization, and securely hashed passwords
     for JWT authentication and document ownership isolation.
"""

import uuid
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    # Unique user ID with enterprise prefix (e.g. 'usr-948f2a1b')
    id = Column(
        String(64),
        primary_key=True,
        default=lambda: f"usr-{uuid.uuid4().hex[:8]}"
    )
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(100), default="Lead AI & Retrieval Engineer")
    organization = Column(String(255), default="Acme Global Defense & Health AI")
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One-to-many relationship: User -> Documents
    # Deleting user cascades deletion to all owned documents
    documents = relationship(
        "Document",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
