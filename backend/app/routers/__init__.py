"""
Routers package initialization.
"""

from app.routers.auth import router as auth_router
from app.routers.documents import router as documents_router
from app.routers.chat import router as chat_router
from app.routers.stats import router as stats_router
from app.routers.evaluation import router as evaluation_router

__all__ = ["auth_router", "documents_router", "chat_router", "stats_router", "evaluation_router"]
