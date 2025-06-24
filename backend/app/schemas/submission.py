from typing import Optional
from pydantic import BaseModel
from app.models import User, Experiment

class SubmissionBase(BaseModel):
    data: str  # atau tipe data lain sesuai kebutuhan

class SubmissionCreate(SubmissionBase):
    experiment_id: int

class Submission(SubmissionBase):
    id: int
    experiment_id: int
    user_id: int
    submitter: Optional[User] = None  # Nested User
    experiment: Optional[Experiment] = None  # Nested Experiment

    class Config:
        orm_mode = True