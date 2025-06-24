from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models import User

class AuditLogBase(BaseModel):
    action: str
    detail: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    # Biasanya tidak perlu field id/created_at, karena diisi otomatis
    pass

class AuditLog(AuditLogBase):
    id: int
    user_id: int
    created_at: datetime
    user: Optional[User] = None

    class Config:
        orm_mode = True