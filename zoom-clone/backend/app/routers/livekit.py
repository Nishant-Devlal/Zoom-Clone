from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.models.meeting import Meeting
from app.models.user import User
from app.utils.security import get_current_user
from app.services.livekit_service import create_livekit_token


router = APIRouter(
    prefix="/api/livekit",
    tags=["LiveKit"],
)


class TokenRequest(BaseModel):
    room_name: str
    participant_name: str


@router.post("/token")
def generate_token(
    data: TokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ---------------------------------------
    # FIND MEETING
    # ---------------------------------------

    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == data.room_name)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    # ---------------------------------------
    # CHECK IF USER IS HOST
    # ---------------------------------------

    is_host = meeting.host_id == current_user.id

    # ---------------------------------------
    # CHECK IF MEETING IS LOCKED
    # ---------------------------------------

    if meeting.locked and not is_host:
        raise HTTPException(
            status_code=403,
            detail=(
                "This meeting is locked. "
                "The host is not accepting new participants."
            ),
        )

    # ---------------------------------------
    # GENERATE LIVEKIT TOKEN
    # ---------------------------------------

    token = create_livekit_token(
        room_name=data.room_name,
        participant_name=data.participant_name,
    )

    return {
        "server_url": os.getenv("LIVEKIT_URL"),
        "participant_token": token,
    }