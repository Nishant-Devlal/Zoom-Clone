from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.meetings import router as meetings_router
from app.routers.livekit import router as livekit_router
from app.routers.profile import router as profile_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="Zoom Clone API",
    version="1.0.0",
)

# Serve uploaded files
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://zoom-clone-frontend-three.vercel.app",
    "https://zoom-clone-nishant.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(meetings_router)
app.include_router(livekit_router)
app.include_router(profile_router)

# Root
@app.get("/")
def root():
    return {
        "message": "Zoom Clone API is running"
    }

# Health check
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }