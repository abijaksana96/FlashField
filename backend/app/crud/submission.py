from sqlalchemy.orm import Session
from app import models
from app.schemas import submission as schemas

def create_submission(db: Session, submission: schemas.SubmissionCreate, experiment_id: int, user_id: int):
    db_submission = models.Submission(
        **submission.model_dump(),
        experiment_id=experiment_id,
        user_id=user_id
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

def get_submissions_for_experiment(db: Session, experiment_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Submission).filter(models.Submission.experiment_id == experiment_id).offset(skip).limit(limit).all()

def get_submission_by_id(db: Session, submission_id: int):
    return db.query(models.Submission).filter(models.Submission.id == submission_id).first()

def update_submission(db: Session, db_obj: models.Submission, obj_in: schemas.SubmissionUpdate):
    for field, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_submission(db: Session, submission_id: int):
    db_obj = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return db_obj

