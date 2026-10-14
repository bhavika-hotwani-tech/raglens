"""
Application Configuration Module.

WHAT: Loads and validates environment variables using Pydantic Settings.
WHY: Centralizes configuration (database URL, JWT keys, Gemini API key, CORS)
     with runtime validation and sensible defaults for local development.
"""

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Strongly typed settings class populated from environment variables and .env file.
    """
    # Database connection string using modern psycopg 3 driver
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/raglens",
        description="PostgreSQL connection string with pgvector support"
    )

    # JWT Authentication settings
    JWT_SECRET_KEY: str = Field(
        default="raglens-enterprise-secret-key-change-in-production-948f2a1b",
        description="Secret key used for signing JWT tokens"
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="Algorithm used for JWT signature generation"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=1440,  # 24 hours
        description="JWT token validity duration in minutes"
    )

    # Google Gemini API key for generating 768-dimensional embeddings
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini API key for gemini-embedding-001 model"
    )
    EMBEDDING_MODEL: str = Field(
        default="gemini-embedding-001",
        description="Gemini model name for vector embeddings"
    )
    GEMINI_EMBEDDING_MODEL: str = Field(
        default="gemini-embedding-001",
        description="Gemini model name for vector embeddings (legacy alias)"
    )
    EMBEDDING_DIMENSIONS: int = Field(
        default=768,
        description="Vector output dimensionality (768d)"
    )

    # Local file storage for uploaded documents before parsing
    UPLOAD_DIR: str = Field(
        default="uploads",
        description="Directory where uploaded PDF/DOCX/TXT files are temporarily preserved"
    )

    # Cross-Origin Resource Sharing (CORS) whitelist
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        description="Comma-separated list of allowed frontend origins"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parses comma-separated CORS_ORIGINS string into a clean list of URLs."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Global singleton instance of settings
settings = Settings()
