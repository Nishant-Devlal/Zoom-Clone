from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.meetings import router as meetings_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zoom Clone API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(meetings_router)

@app.get("/")
def root():
    return {
        "message": "Zoom Clone API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }