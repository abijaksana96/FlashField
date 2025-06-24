from typing import Optional
from pydantic import BaseModel
from app.models import User

class ExperimentBase(BaseModel):
    title: str
    description: Optional[str] = None

class ExperimentCreate(ExperimentBase):
    pass

class ExperimentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Experiment(ExperimentBase):
    id: int
    created_by: int
    owner: Optional[User] = None  # Nested User

    class Config:
        orm_mode = True