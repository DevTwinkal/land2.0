from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, land_records, mutations
from .db.database import engine
from .models.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app - this "app" variable is what's missing
app = FastAPI(
    title="Digital Land Records API",
    description="API for managing digital land records with tamper-proof verification",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:8080", 
    "http://127.0.0.1:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(land_records.router)
app.include_router(mutations.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Digital Land Records API"}