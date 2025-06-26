from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import experiment as schemas
from app.crud import experiment as crud
from app.models import Experiment as models
from app.database import get_db
from app.core.dependencies import get_current_active_user, role_checker
from app.models import User
from app.crud.submission import create_submission as create_submission_crud, get_submissions_for_experiment
from app.schemas.submission import SubmissionCreate, Submission

router = APIRouter(prefix="/experiments", tags=["experiments"])

@router.post("/", response_model=schemas.Experiment, status_code=status.HTTP_201_CREATED, dependencies=[Depends(role_checker(["researcher", "admin"]))])
def create_new_experiment(
    experiment: schemas.ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.create_experiment(db=db, experiment=experiment, user_id=current_user.id)

@router.get("/", response_model=list[schemas.Experiment])
def read_all_experiments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_experiments(db, skip=skip, limit=limit)

@router.get("/{experiment_id}", response_model=schemas.Experiment)
def read_experiment(experiment_id: int, db: Session = Depends(get_db)):
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return db_experiment

@router.put("/{experiment_id}", response_model=schemas.Experiment)
def update_existing_experiment(
    experiment_id: int,
    experiment_in: schemas.ExperimentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    if db_experiment.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this experiment")
    return crud.update_experiment(db=db, db_obj=db_experiment, obj_in=experiment_in)

@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    if db_experiment.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this experiment")
    crud.delete_experiment(db=db, experiment_id=experiment_id)
    return {"ok": True}

# --- Submissions for an Experiment ---

@router.post("/{experiment_id}/submissions", response_model=Submission, status_code=status.HTTP_201_CREATED)
def submit_to_experiment(
    experiment_id: int,
    submission: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return create_submission_crud(db=db, submission=submission, experiment_id=experiment_id, user_id=current_user.id)

@router.get("/{experiment_id}/submissions", response_model=list[Submission], dependencies=[Depends(role_checker(["researcher", "admin"]))])
def get_experiment_submissions(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    return get_submissions_for_experiment(db=db, experiment_id=experiment_id)