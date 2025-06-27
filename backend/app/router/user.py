from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.crud import user as user_crud
from app.schemas import user as user_schemas
from app.database import get_db
from app.core.dependencies import get_current_active_user, role_checker
from app.models import User
from app.crud import submission as submission_crud
from app.schemas import submission as submission_schemas

router = APIRouter(prefix="/users", tags=["users"])

# Endpoint untuk mengambil data diri user yang sedang login
@router.get("/me", response_model=user_schemas.User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Endpoint untuk user mengupdate data diri user yang sedang login
@router.put("/me", response_model=user_schemas.User)
def update_own_profile(
    updates: user_schemas.UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Cek jika email baru sudah digunakan oleh user lain
    if updates.email and updates.email != current_user.email:
        db_user_with_new_email = user_crud.get_user_by_email(db, email=updates.email)
        if db_user_with_new_email:
            raise HTTPException(status_code=400, detail="Email ini sudah terdaftar.")
            
    return user_crud.update_user(db=db, db_user=current_user, updates=updates)

# Endpoint untuk menghapus data diri user yang sedang login
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_own_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_crud.delete_user(db=db, db_user=current_user)
    return None

# Menampilkan daftar semua data yang pernah user kirim
@router.get("/me/submissions", response_model=list[submission_schemas.Submission])
def read_own_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return submission_crud.get_submissions_by_user(db=db, user_id=current_user.id)


# Endpoint untuk mendapatkan semua user (khusus admin)
@router.get("/", response_model=list[user_schemas.User], dependencies=[Depends(role_checker(["admin"]))])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users

# Endpoint update user (khusus admin)
@router.put("/{user_id}", response_model=user_schemas.User, dependencies=[Depends(role_checker(["admin"]))])
def update_user(user_id: int, updates: user_schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = user_crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_crud.update_user(db, db_user, updates)

# Endpoint delete user (khusus admin)
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(role_checker(["admin"]))])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user_crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user_crud.delete_user(db, db_user)
    return None