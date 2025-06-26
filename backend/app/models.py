from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Tabel User
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="volunteer")  # "volunteer", "researcher", "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, comment="Waktu dibuat")

    # Relationships
    experiments = relationship("Experiment", back_populates="owner", cascade="all, delete")
    submissions = relationship("Submission", back_populates="submitter", cascade="all, delete")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete")

# Tabel Experiment
class Experiment(Base):
    __tablename__ = "experiments"  # Nama tabel di database
    id = Column(Integer, primary_key=True, index=True, comment="ID Eksperimen")
    title = Column(String, nullable=False, comment="Judul")
    description = Column(Text, comment="Deskripsi")
    deadline = Column(DateTime(timezone=True), nullable=True, comment="Batas waktu partisipasi")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, comment="ID User pembuat")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, comment="Waktu dibuat")
    owner = relationship("User", back_populates="experiments")
    submissions = relationship("Submission", back_populates="experiment", cascade="all, delete")

# Tabel Submission
class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True, comment="ID Submission")
    experiment_id = Column(Integer, ForeignKey("experiments.id"), nullable=False, comment="ID Eksperimen terkait")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="ID User pengirim")
    geo_lat = Column(Float, nullable=False, comment="Latitude")
    geo_lng = Column(Float, nullable=False, comment="Longitude")
    data_json = Column(JSON, nullable=False, comment="Data pengamatan (mis: {level_db: 75.5})")
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, comment="Waktu pengiriman")
    experiment = relationship("Experiment", back_populates="submissions")
    submitter = relationship("User", back_populates="submissions")

# Tabel AuditLog
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True, comment="ID Log")
    action = Column(String, nullable=False, comment="Aksi yang dilakukan (mis: USER_LOGIN)")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, comment="ID User yang melakukan aksi")
    details = Column(String, comment="Detail tambahan")
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, comment="Waktu aksi")
    user = relationship("User", back_populates="audit_logs")
