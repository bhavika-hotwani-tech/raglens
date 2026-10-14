"""
Conversation & Chat Message Models.

WHAT: Defines ORM entities for conversation threads, messages, citations, and pipeline telemetry.
WHY: Persists user chat sessions, grounded sources, and feedback in PostgreSQL
     so users can audit past queries and retrieve conversation history.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True, default=lambda: f"conv-{uuid.uuid4().hex[:8]}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="New Grounded Investigation")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(64), primary_key=True, default=lambda: f"msg-{uuid.uuid4().hex[:8]}")
    conversation_id = Column(String(64), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(32), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True, default=list)
    pipeline_trace = Column(JSON, nullable=True, default=list)
    rating = Column(String(16), nullable=True)  # "up", "down", or None
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")
