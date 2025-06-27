from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models
from app.schemas import submission as schemas
from typing import Dict, Any

def validate_submission_data(experiment: models.Experiment, submission_data: Dict[str, Any]) -> None:
    """
    Validasi data submission berdasarkan konfigurasi input_fields experiment
    """
    input_fields = experiment.input_fields
    
    # Validasi setiap field yang dikonfigurasi
    for field_config in input_fields:
        field_name = field_config['name']
        field_type = field_config['type']
        is_required = field_config.get('required', True)
        
        # Cek apakah field wajib ada
        if is_required and field_name not in submission_data:
            raise HTTPException(
                status_code=400, 
                detail=f"Field '{field_config['label']}' ({field_name}) wajib diisi"
            )
        
        # Skip validasi jika field tidak ada dan tidak wajib
        if field_name not in submission_data:
            continue
            
        value = submission_data[field_name]
        
        # Validasi tipe data
        if field_type == 'number':
            try:
                float(value)
                # Validasi range jika ada
                if 'min_value' in field_config and field_config['min_value'] is not None:
                    if float(value) < field_config['min_value']:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Field '{field_config['label']}' harus minimal {field_config['min_value']}"
                        )
                if 'max_value' in field_config and field_config['max_value'] is not None:
                    if float(value) > field_config['max_value']:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Field '{field_config['label']}' harus maksimal {field_config['max_value']}"
                        )
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Field '{field_config['label']}' harus berupa angka"
                )
        
        elif field_type in ['text', 'textarea']:
            if not isinstance(value, str):
                raise HTTPException(
                    status_code=400,
                    detail=f"Field '{field_config['label']}' harus berupa teks"
                )
            # Validasi panjang teks
            if 'min_length' in field_config and field_config['min_length'] is not None:
                if len(value) < field_config['min_length']:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Field '{field_config['label']}' minimal {field_config['min_length']} karakter"
                    )
            if 'max_length' in field_config and field_config['max_length'] is not None:
                if len(value) > field_config['max_length']:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Field '{field_config['label']}' maksimal {field_config['max_length']} karakter"
                    )
        
        elif field_type in ['select', 'radio']:
            options = field_config.get('options', [])
            if options and value not in options:
                raise HTTPException(
                    status_code=400,
                    detail=f"Field '{field_config['label']}' harus salah satu dari: {', '.join(options)}"
                )
        
        elif field_type == 'checkbox':
            if not isinstance(value, list):
                raise HTTPException(
                    status_code=400,
                    detail=f"Field '{field_config['label']}' harus berupa array"
                )
            options = field_config.get('options', [])
            if options:
                for item in value:
                    if item not in options:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Field '{field_config['label']}' mengandung pilihan tidak valid: {item}"
                        )

def create_submission(db: Session, submission: schemas.SubmissionCreate, user_id: int):
    # Ambil experiment untuk validasi
    experiment = db.query(models.Experiment).filter(
        models.Experiment.id == submission.experiment_id
    ).first()
    
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment tidak ditemukan")
    
    # Validasi apakah lokasi diperlukan
    if experiment.require_location:
        if submission.geo_lat is None or submission.geo_lng is None:
            raise HTTPException(
                status_code=400,
                detail="Experiment ini memerlukan data lokasi (latitude dan longitude)"
            )
    
    # Validasi data sesuai konfigurasi field
    validate_submission_data(experiment, submission.data_json)
    
    db_submission = models.Submission(
        experiment_id=submission.experiment_id,
        user_id=user_id,
        geo_lat=submission.geo_lat,
        geo_lng=submission.geo_lng,
        data_json=submission.data_json
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
    

def get_submissions_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Mengambil semua submisi yang dibuat oleh seorang pengguna, 
    diurutkan dari yang terbaru.
    """
    return db.query(models.Submission).filter(models.Submission.user_id == user_id).order_by(models.Submission.timestamp.desc()).offset(skip).limit(limit).all()
