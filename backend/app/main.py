from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import api, auth, artists, fan_preferences
from app.db.database import init_db

app = FastAPI(
    title="Kobe AI API",
    description="Backend API for Kobe AI Hackathon project",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize database
@app.on_event("startup")
async def startup_db_client():
    init_db()


# Include routers
app.include_router(api.router)
app.include_router(auth.router)
app.include_router(artists.router)
app.include_router(fan_preferences.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Kobe AI API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Add your API routes here
