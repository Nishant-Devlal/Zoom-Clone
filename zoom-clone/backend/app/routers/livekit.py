from fastapi import APIRouter
from pydantic import BaseModel

from app.services.livekit_service import create_livekit_token


router = APIRouter(
    prefix="/api/livekit",
    tags=["LiveKit"],
)


class TokenRequest(BaseModel):
    room_name: str
    participant_name: str


@router.post("/token")
def generate_token(data: TokenRequest):

    token = create_livekit_token(
        room_name=data.room_name,
        participant_name=data.participant_name,
    )

    return {
        "token": token
    }