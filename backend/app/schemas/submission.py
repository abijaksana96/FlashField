from pydantic import BaseModel, Field
from typing import Any, Dict, Optional
from datetime import datetime

class SubmissionBase(BaseModel):
    geo_lat: Optional[float] = Field(default=None, description="Latitude (opsional)")
    geo_lng: Optional[float] = Field(default=None, description="Longitude (opsional)")
    data_json: Dict[str, Any] = Field(description="Data pengamatan sesuai konfigurasi field experiment")

class SubmissionCreate(SubmissionBase):
    experiment_id: int = Field(description="ID experiment")

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