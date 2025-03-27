from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    aadhaar_number: str

class UserResponse(UserBase):
    id: str
    aadhaar_number: str
    is_admin: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Land record schemas
class LandRecordBase(BaseModel):
    property_address: str
    area_sqft: float
    survey_number: str
    geo_latitude: Optional[float] = None
    geo_longitude: Optional[float] = None

class LandRecordCreate(LandRecordBase):
    pass

class LandRecordResponse(LandRecordBase):
    id: str
    owner_id: str
    document_hash: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Mutation schemas
class MutationCreate(BaseModel):
    land_id: str
    new_owner_id: str
    mutation_reason: str

class MutationResponse(BaseModel):
    id: str
    land_id: str
    previous_owner_id: str
    new_owner_id: str
    mutation_date: datetime
    mutation_reason: str
    transaction_id: str
    status: str
    
    model_config = ConfigDict(from_attributes=True)

# Document schemas
class DocumentCreate(BaseModel):
    land_id: str
    document_type: str

class DocumentResponse(BaseModel):
    id: str
    land_id: str
    document_type: str
    file_name: str
    file_hash: str
    uploaded_at: datetime
    
    model_config = ConfigDict(from_attributes=True)