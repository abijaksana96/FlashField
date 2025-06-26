from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from app.schemas import user
from app.schemas import submission as submission_schema

# Schema untuk field input yang dikonfigurasi researcher
class InputField(BaseModel):
    name: str = Field(description="Nama field")
    label: str = Field(description="Label yang ditampilkan ke user")
    type: str = Field(description="Tipe input: text, number, textarea, select, radio, checkbox, date, time, datetime")
    required: bool = Field(default=True, description="Apakah field wajib diisi")
    placeholder: Optional[str] = Field(default=None, description="Placeholder text")
    description: Optional[str] = Field(default=None, description="Deskripsi bantuan untuk field")
    options: Optional[List[str]] = Field(default=None, description="Opsi untuk select/radio/checkbox")
    min_value: Optional[Union[int, float]] = Field(default=None, description="Nilai minimum untuk number")
    max_value: Optional[Union[int, float]] = Field(default=None, description="Nilai maksimum untuk number")
    min_length: Optional[int] = Field(default=None, description="Panjang minimum untuk text")
    max_length: Optional[int] = Field(default=None, description="Panjang maksimum untuk text")

class ExperimentBase(BaseModel):
    title: str
    description: Optional[str] = None
    input_fields: List[InputField] = Field(description="Konfigurasi field input yang diperlukan")
    require_location: bool = Field(default=True, description="Apakah memerlukan data lokasi")
    deadline: Optional[datetime] = None

class ExperimentCreate(ExperimentBase):
    pass

class ExperimentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    input_fields: Optional[List[InputField]] = None
    require_location: Optional[bool] = None
    deadline: Optional[datetime] = None

class Experiment(ExperimentBase):
    id: int
    created_by: int
    created_at: datetime
    owner: user.User
    submissions : Optional[List[submission_schema.Submission]] = None

    class Config:
        from_attributes = True