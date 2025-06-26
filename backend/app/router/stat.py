from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Submission
from app.crud.experiment import get_experiment
from app.core.dependencies import role_checker
from pydantic import BaseModel

router = APIRouter(prefix="/stats", tags=["statistics"], dependencies=[Depends(role_checker(["researcher", "admin"]))])

class StatsSummary(BaseModel):
    total_submissions: int
    average_value: float | None = None

@router.get("/summary")
def get_stats_summary(exp_id: int, db: Session = Depends(get_db)):
    experiment = get_experiment(db, exp_id)
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    total_submissions = db.query(Submission).filter(Submission.experiment_id == exp_id).count()

    # Contoh: Menghitung rata-rata 'level_db' jika ada
    avg_query = db.query(func.avg(Submission.data_json['level_db'].as_float())).filter(Submission.experiment_id == exp_id).scalar()

    return {
        "total_submissions": total_submissions,
        "average_level_db": round(avg_query, 2) if avg_query is not None else "N/A"
    }
