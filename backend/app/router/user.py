from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.crud import user as user_crud
from app.schemas import user as user_schemas
from app.database import get_db
from app.core.dependencies import get_current_active_user, role_checker
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=user_schemas.User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user
    
@router.get("/", response_model=list[user_schemas.User], dependencies=[Depends(role_checker(["admin"]))])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users