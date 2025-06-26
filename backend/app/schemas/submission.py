from pydantic import BaseModel
from typing import Any
from datetime import datetime

class SubmissionBase(BaseModel):
    geo_lat: float
    geo_lng: float
    data_json: dict[str, Any]

class SubmissionCreate(SubmissionBase):
    pass

class Submission(SubmissionBase):
    id: int
    experiment_id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True