import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from ..db.database import get_db
from ..models.models import MutationRecord, LandRecord
from ..schemas.schemas import MutationCreate, MutationResponse
from ..core.security import calculate_file_hash
from .auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/mutations", tags=["Mutations"])

@router.post("/", response_model=MutationResponse)
async def create_mutation(
    mutation: MutationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new mutation record (ownership transfer request)"""
    # Verify land record exists and user owns it
    land_record = db.query(LandRecord).filter(LandRecord.id == mutation.land_id).first()
    if not land_record:
        raise HTTPException(status_code=404, detail="Land record not found")
    
    if land_record.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to transfer this record")
    
    # Verify new owner exists
    new_owner = db.query(User).filter(User.id == mutation.new_owner_id).first()
    if not new_owner:
        raise HTTPException(status_code=404, detail="New owner not found")
    
    # Create unique transaction ID
    transaction_id = f"MUT-{str(uuid.uuid4())[:8]}-{str(uuid.uuid4())[:4]}"
    
    # Create mutation record
    db_mutation = MutationRecord(
        land_id=mutation.land_id,
        previous_owner_id=current_user.id,
        new_owner_id=mutation.new_owner_id,
        mutation_reason=mutation.mutation_reason,
        transaction_id=transaction_id,
        status="pending"
    )
    
    db.add(db_mutation)
    db.commit()
    db.refresh(db_mutation)
    return db_mutation

@router.get("/", response_model=List[MutationResponse])
async def read_mutations(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all mutation records related to the current user"""
    if current_user.is_admin:
        # Admins can see all mutations
        mutations = db.query(MutationRecord).offset(skip).limit(limit).all()
    else:
        # Regular users see mutations where they are previous or new owner
        mutations = db.query(MutationRecord).filter(
            (MutationRecord.previous_owner_id == current_user.id) | 
            (MutationRecord.new_owner_id == current_user.id)
        ).offset(skip).limit(limit).all()
    return mutations

@router.put("/{mutation_id}/approve", response_model=MutationResponse)
async def approve_mutation(
    mutation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a mutation (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can approve mutations")
    
    mutation = db.query(MutationRecord).filter(MutationRecord.id == mutation_id).first()
    if not mutation:
        raise HTTPException(status_code=404, detail="Mutation record not found")
    
    if mutation.status != "pending":
        raise HTTPException(status_code=400, detail=f"Mutation is already {mutation.status}")
    
    # Update mutation status
    mutation.status = "approved"
    
    # Transfer ownership of the land record
    land_record = db.query(LandRecord).filter(LandRecord.id == mutation.land_id).first()
    if land_record:
        land_record.owner_id = mutation.new_owner_id
    
    # Generate verification hash
    verification_data = f"{mutation.id}-{mutation.land_id}-{mutation.previous_owner_id}-{mutation.new_owner_id}-approved"
    mutation.verification_hash = hashlib.sha256(verification_data.encode()).hexdigest()
    
    db.commit()
    db.refresh(mutation)
    return mutation

@router.put("/{mutation_id}/reject", response_model=MutationResponse)
async def reject_mutation(
    mutation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject a mutation (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can reject mutations")
    
    mutation = db.query(MutationRecord).filter(MutationRecord.id == mutation_id).first()
    if not mutation:
        raise HTTPException(status_code=404, detail="Mutation record not found")
    
    if mutation.status != "pending":
        raise HTTPException(status_code=400, detail=f"Mutation is already {mutation.status}")
    
    # Update mutation status
    mutation.status = "rejected"
    
    # Generate verification hash
    verification_data = f"{mutation.id}-{mutation.land_id}-{mutation.previous_owner_id}-{mutation.new_owner_id}-rejected"
    mutation.verification_hash = hashlib.sha256(verification_data.encode()).hexdigest()
    
    db.commit()
    db.refresh(mutation)
    return mutation