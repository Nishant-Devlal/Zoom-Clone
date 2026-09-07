from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.meetings import router as meetings_router
from app.routers.livekit import router as livekit_router


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
app.include_router(livekit_router)


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