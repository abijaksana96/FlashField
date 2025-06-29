from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv() # baca .env file
DATABASE_URL = os.getenv("DATABASE_URL") # ambil URL database dari .env

# Inisialisasi SQLAlchemy
engine = create_engine(DATABASE_URL) # Buat koneksi ke database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # Buat session factory
Base = declarative_base() # Buat base class untuk model

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Buat semua tabel yang didefinisikan dalam models"""
    from app.models import User, Experiment, Submission  # Import semua model
    Base.metadata.create_all(bind=engine)  
