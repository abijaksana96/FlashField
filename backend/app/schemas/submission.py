from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime

class SubmissionBase(BaseModel):
    geo_lat: float
    geo_lng: float
    data_json: dict[str, Any]

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUpdate(BaseModel):
    geo_lat: Optional[float] = None
    geo_lng: Optional[float] = None
    data_json: Optional[Dict[str, Any]] = None

class Submission(SubmissionBase):
    id: int
    experiment_id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True