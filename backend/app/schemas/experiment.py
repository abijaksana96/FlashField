from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas import user
from app.schemas import submission as submission_schema

class ExperimentBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class ExperimentCreate(ExperimentBase):
    pass

class ExperimentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class Experiment(ExperimentBase):
    id: int
    created_by: int
    created_at: datetime
    owner: user.User
    submissions : Optional[list[submission_schema.Submission]] = None

    class Config:
        from_attributes = True