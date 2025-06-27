from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import experiment as schemas
from app.crud import experiment as crud
from app.models import Experiment as models
from app.database import get_db
from app.core.dependencies import get_current_active_user, role_checker
from app.models import User
from app.crud.submission import create_submission as create_submission_crud, get_submissions_for_experiment, delete_submission, get_submission_by_id
from app.schemas.submission import SubmissionCreate, Submission

router = APIRouter(prefix="/experiments", tags=["experiments"])

# --- PERUBAHAN DI SINI ---
# Admin dihapus dari daftar peran yang diizinkan. Hanya researcher yang bisa membuat.
@router.post("/", response_model=schemas.Experiment, status_code=status.HTTP_201_CREATED, dependencies=[Depends(role_checker(["researcher"]))])
def create_new_experiment(
    experiment: schemas.ExperimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.create_experiment(db=db, experiment=experiment, user_id=current_user.id)


# --- TIDAK ADA PERUBAHAN --- (Publik)
@router.get("/", response_model=list[schemas.Experiment])
def read_all_experiments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_experiments(db, skip=skip, limit=limit)


# --- TIDAK ADA PERUBAHAN --- (Publik)
@router.get("/{experiment_id}", response_model=schemas.Experiment)
def read_experiment(experiment_id: int, db: Session = Depends(get_db)):
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return db_experiment


# --- TIDAK ADA PERUBAHAN --- (Publik)
@router.get("/{experiment_id}/fields")
def get_experiment_fields(experiment_id: int, db: Session = Depends(get_db)):
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    return {
        "experiment_id": experiment_id,
        "title": db_experiment.title,
        # ... (sisa field)
    }


# --- PERUBAHAN DI SINI ---
# Kondisi `and current_user.role != "admin"` dihapus.
# Sekarang hanya pemilik eksperimen (researcher) yang bisa mengedit. Admin tidak bisa.
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
    # Hanya pemilik yang bisa mengedit
    if db_experiment.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this experiment")
    return crud.update_experiment(db=db, db_obj=db_experiment, obj_in=experiment_in)


# --- TIDAK ADA PERUBAHAN ---
# Logika ini sudah benar. Admin tetap bisa menghapus eksperimen mana pun.
@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    # Pemilik ATAU admin bisa menghapus
    if db_experiment.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this experiment")
    crud.delete_experiment(db=db, experiment_id=experiment_id)
    return {"ok": True}


# --- Submissions for an Experiment ---

# --- TIDAK ADA PERUBAHAN --- (Volunteer bisa submit)
@router.post("/{experiment_id}/submissions", response_model=Submission, status_code=status.HTTP_201_CREATED)
def submit_to_experiment(
    experiment_id: int,
    submission: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # ... (logika tetap sama)
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return create_submission_crud(db=db, submission=submission, user_id=current_user.id)


# --- TIDAK ADA PERUBAHAN --- (Researcher & Admin bisa lihat submisi)
@router.get("/{experiment_id}/submissions", response_model=list[Submission], dependencies=[Depends(role_checker(["researcher", "admin"]))])
def get_experiment_submissions(
    experiment_id: int,
    db: Session = Depends(get_db)
):
    return get_submissions_for_experiment(db=db, experiment_id=experiment_id)


# --- ENDPOINT BARU --- Delete individual submission
@router.delete("/submissions/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_individual_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Hapus submission individual.
    - Admin bisa hapus submission apa pun
    - Researcher hanya bisa hapus submission dari experiment mereka sendiri
    - Volunteer hanya bisa hapus submission mereka sendiri
    """
    # Cek apakah submission exists
    db_submission = get_submission_by_id(db, submission_id=submission_id)
    if db_submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Permission check berdasarkan role
    if current_user.role == "admin":
        # Admin bisa hapus submission apa pun
        pass
    elif current_user.role == "researcher":
        # Researcher hanya bisa hapus submission dari experiment mereka
        db_experiment = crud.get_experiment(db, experiment_id=db_submission.experiment_id)
        if db_experiment is None or db_experiment.created_by != current_user.id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to delete this submission"
            )
    elif current_user.role == "volunteer":
        # Volunteer hanya bisa hapus submission mereka sendiri
        if db_submission.user_id != current_user.id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to delete this submission"
            )
    else:
        raise HTTPException(
            status_code=403, 
            detail="Insufficient permissions"
        )
    
    # Hapus submission
    delete_submission(db=db, submission_id=submission_id)
    return {"ok": True}


# --- ENDPOINT ALTERNATIF --- Delete submission melalui experiment
@router.delete("/{experiment_id}/submissions/{submission_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(role_checker(["researcher", "admin"]))])
def delete_experiment_submission(
    experiment_id: int,
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Hapus submission specific untuk experiment.
    Hanya researcher (pemilik experiment) dan admin yang bisa akses.
    """
    # Cek apakah experiment exists
    db_experiment = crud.get_experiment(db, experiment_id=experiment_id)
    if db_experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Cek apakah submission exists dan belongs to this experiment
    db_submission = get_submission_by_id(db, submission_id=submission_id)
    if db_submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if db_submission.experiment_id != experiment_id:
        raise HTTPException(
            status_code=400, 
            detail="Submission does not belong to this experiment"
        )
    
    # Permission check: hanya pemilik experiment atau admin
    if current_user.role != "admin" and db_experiment.created_by != current_user.id:
        raise HTTPException(
            status_code=403, 
            detail="Not authorized to delete submissions from this experiment"
        )
    
    # Hapus submission
    delete_submission(db=db, submission_id=submission_id)
    return {"ok": True}