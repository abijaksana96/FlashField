from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.crud import user as user_crud
from app.schemas import user as user_schemas
from app.database import get_db
from app.core.dependencies import get_current_active_user, role_checker
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])

# Endpoint untuk mengambil data diri user yang sedang login
@router.get("/me", response_model=user_schemas.User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

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

# Endpoint: Hapus akun sendiri
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_own_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_crud.delete_user(db, current_user)
    return None
