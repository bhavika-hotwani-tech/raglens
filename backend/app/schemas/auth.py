"""
Authentication Pydantic Schemas.

WHAT: Defines request/response schemas for user registration, login, and identity verification.
WHY: Validates incoming payloads and guarantees JSON responses strictly match API_CONTRACT.md.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    """Payload for POST /auth/register"""
    name: str = Field(..., min_length=1, max_length=255, description="Full name of user")
    email: EmailStr = Field(..., description="Enterprise email address")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")


class UserLogin(BaseModel):
    """Payload for POST /auth/login"""
    email: EmailStr = Field(..., description="Enterprise email address")
    password: str = Field(..., min_length=1, description="Account password")


class UserResponse(BaseModel):
    """
    User profile representation returned on login, register, and GET /auth/me.
    Matches exact JSON keys in API_CONTRACT.md.
    """
    id: str
    name: str
    email: str
    role: str
    organization: str
    avatar_url: Optional[str] = Field(default=None, serialization_alias="avatarUrl")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )


class AuthResponse(BaseModel):
    """Response returned upon successful registration or login."""
    token: str
    user: UserResponse

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )
