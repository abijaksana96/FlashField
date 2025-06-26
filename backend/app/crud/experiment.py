from sqlalchemy.orm import Session
from app import models
from app.schemas import experiment as schemas

def get_experiment(db: Session, experiment_id: int):
    return db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()

def get_experiments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Experiment).order_by(models.Experiment.created_at.desc()).offset(skip).limit(limit).all()

def create_experiment(db: Session, experiment: schemas.ExperimentCreate, user_id: int):
    db_experiment = models.Experiment(**experiment.model_dump(), created_by=user_id)
    db.add(db_experiment)
    db.commit()
    db.refresh(db_experiment)
    return db_experiment

def update_experiment(db: Session, db_obj: models.Experiment, obj_in: schemas.ExperimentUpdate):
    update_data = obj_in.dict(exclude_unset=True)  # ✅ hanya field yang dikirim oleh user

    for field, value in update_data.items():
        setattr(db_obj, field, value)

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_experiment(db: Session, experiment_id: int):
    db_obj = db.query(models.Experiment).get(experiment_id)
    db.delete(db_obj)
    db.commit()
    return db_obj