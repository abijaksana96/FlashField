from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int

    class Config:
        orm_mode = True