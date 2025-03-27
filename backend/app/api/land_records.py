from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from ..db.database import get_db
from ..models.models import LandRecord, Document
from ..schemas.schemas import LandRecordCreate, LandRecordResponse, DocumentResponse
from ..core.security import calculate_file_hash
from .auth import get_current_user
from ..models.models import User
from pathlib import Path

router = APIRouter(prefix="/land-records", tags=["Land Records"])

# Ensure upload directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/", response_model=LandRecordResponse)
async def create_land_record(
    land_record: LandRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new land record"""
    # Check if survey number already exists
    existing_record = db.query(LandRecord).filter(LandRecord.survey_number == land_record.survey_number).first()
    if existing_record:
        raise HTTPException(status_code=400, detail="Survey number already registered")
    
    # Create the record
    db_land_record = LandRecord(
        owner_id=current_user.id,
        property_address=land_record.property_address,
        area_sqft=land_record.area_sqft,
        survey_number=land_record.survey_number,
        geo_latitude=land_record.geo_latitude,
        geo_longitude=land_record.geo_longitude
    )
    
    db.add(db_land_record)
    db.commit()
    db.refresh(db_land_record)
    return db_land_record

@router.get("/", response_model=List[LandRecordResponse])
async def read_land_records(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all land records owned by the current user"""
    if current_user.is_admin:
        # Admins can see all records
        records = db.query(LandRecord).offset(skip).limit(limit).all()
    else:
        # Regular users see only their records
        records = db.query(LandRecord).filter(LandRecord.owner_id == current_user.id).offset(skip).limit(limit).all()
    return records

@router.get("/{record_id}", response_model=LandRecordResponse)
async def read_land_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific land record"""
    record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found")
    
    # Only owner or admin can view the record
    if record.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this record")
        
    return record

@router.post("/{record_id}/documents", response_model=DocumentResponse)
async def upload_document(
    record_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for a land record"""
    # Verify land record exists and user owns it
    record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found")
    
    if record.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to upload to this record")
    
    # Create a directory for this record if it doesn't exist
    record_dir = UPLOAD_DIR / record_id
    record_dir.mkdir(exist_ok=True)
    
    # Save the file with a unique name
    file_uuid = str(uuid.uuid4())
    filename_parts = os.path.splitext(file.filename)
    secure_filename = f"{file_uuid}{filename_parts[1]}"
    file_path = record_dir / secure_filename
    
    with open(file_path, "wb") as buffer:
        contents = await file.read()
        buffer.write(contents)
    
    # Calculate file hash for tamper-proof verification
    file_hash = calculate_file_hash(file_path)
    
    # Save document record to database
    db_document = Document(
        land_id=record_id,
        document_type=document_type,
        file_path=str(file_path),
        file_name=file.filename,
        file_hash=file_hash
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Update land record with latest document hash
    record.document_hash = file_hash
    db.commit()
    
    return db_document

@router.get("/{record_id}/documents", response_model=List[DocumentResponse])
async def get_documents(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all documents for a land record"""
    # Verify land record exists and user can access it
    record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found")
    
    if record.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this record")
    
    # Get all documents for this record
    documents = db.query(Document).filter(Document.land_id == record_id).all()
    return documents