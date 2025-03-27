from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    aadhaar_number = Column(String, unique=True, index=True)  # For KYC verification
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    
    land_records = relationship("LandRecord", back_populates="owner")


class LandRecord(Base):
    __tablename__ = "land_records"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    property_address = Column(String)
    area_sqft = Column(Float)
    survey_number = Column(String, index=True, unique=True)
    document_hash = Column(String, nullable=True)  # For tamper-proof verification
    geo_latitude = Column(Float, nullable=True)    # For geospatial mapping
    geo_longitude = Column(Float, nullable=True)   # For geospatial mapping
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    owner = relationship("User", back_populates="land_records")
    mutations = relationship("MutationRecord", back_populates="land_record")
    documents = relationship("Document", back_populates="land_record")


class MutationRecord(Base):
    __tablename__ = "mutation_records"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    land_id = Column(String, ForeignKey("land_records.id"))
    previous_owner_id = Column(String, ForeignKey("users.id"))
    new_owner_id = Column(String, ForeignKey("users.id"))
    mutation_date = Column(DateTime, default=datetime.now)
    mutation_reason = Column(String)
    transaction_id = Column(String, unique=True)
    status = Column(String, default="pending")  # pending, approved, rejected
    verification_hash = Column(String, nullable=True)  # For tamper-proof verification
    
    land_record = relationship("LandRecord", back_populates="mutations")
    previous_owner = relationship("User", foreign_keys=[previous_owner_id])
    new_owner = relationship("User", foreign_keys=[new_owner_id])


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    land_id = Column(String, ForeignKey("land_records.id"))
    document_type = Column(String)  # deed, survey, tax receipt, etc.
    file_path = Column(String)
    file_name = Column(String)
    file_hash = Column(String)  # For tamper-proof verification
    uploaded_at = Column(DateTime, default=datetime.now)
    
    land_record = relationship("LandRecord", back_populates="documents")