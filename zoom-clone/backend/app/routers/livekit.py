import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.meeting import Meeting
from app.models.user import User
from app.models.active_meeting_session import ActiveMeetingSession
from app.utils.security import get_current_user
from app.services.livekit_service import create_livekit_token

router = APIRouter(
    prefix="/api/livekit",
    tags=["LiveKit"],
)

# REQUEST SCHEMAS
class TokenRequest(BaseModel):
    room_name: str
    participant_name: str


class MeetingSessionRequest(BaseModel):
    meeting_id: str


# GENERATE LIVEKIT TOKEN
@router.post("/token")
def generate_token(
    data: TokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # 1. FIND MEETING
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
        
    # 2. CHECK IF USER IS HOST
    is_host = meeting.host_id == current_user.id

    # 3. CHECK IF MEETING IS LOCKED
    if meeting.locked and not is_host:
        raise HTTPException(
            status_code=403,
            detail=(
                "This meeting is locked. "
                "The host is not accepting new participants."
            ),
        )

    # 4. REMOVE STALE SESSIONS
    stale_time = datetime.utcnow() - timedelta(seconds=90)
    stale_sessions = (
        db.query(ActiveMeetingSession)
        .filter(
            ActiveMeetingSession.last_seen_at < stale_time
        )
        .all()
    )
    for session in stale_sessions:
        db.delete(session)
    db.commit()

    # 5. CHECK IF USER IS ALREADY IN A MEETING
    existing_session = (
        db.query(ActiveMeetingSession)
        .filter(
            ActiveMeetingSession.user_id == current_user.id
        )
        .first()
    )

    if existing_session:
        if existing_session.meeting_id != meeting.meeting_id:

            current_meeting = (
                db.query(Meeting)
                .filter(
                    Meeting.meeting_id ==
                    existing_session.meeting_id
                )
                .first()
            )

            current_title = (
                current_meeting.title
                if current_meeting
                else "Another meeting"
            )

            raise HTTPException(
                status_code=409,
                detail={
                    "message": "You are already in another meeting.",
                    "meeting_id": existing_session.meeting_id,
                    "meeting_title": current_title,
                },
            )

        existing_session.last_seen_at = datetime.utcnow()
        db.commit()

        try:
            token = create_livekit_token(
                room_name=data.room_name,
                participant_name=current_user.name,
            )
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Unable to generate LiveKit token.",
            )

        return {
            "server_url": os.getenv("LIVEKIT_URL"),
            "participant_token": token,
        }

    # 6. CREATE ACTIVE MEETING SESSION
    active_session = ActiveMeetingSession(
        user_id=current_user.id,
        meeting_id=meeting.meeting_id,
        joined_at=datetime.utcnow(),
        last_seen_at=datetime.utcnow(),
    )

    try:
        db.add(active_session)
        db.commit()
        db.refresh(active_session)

    except IntegrityError:
        # This protects against two devices trying to join at exactly the same time.
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "You are already in another meeting. "
                "Please leave your current meeting first."
            ),
        )

    # 7. GENERATE LIVEKIT TOKEN
    try:
        token = create_livekit_token(
            room_name=data.room_name,
            participant_name=current_user.name,
        )

    except Exception:
        db.delete(active_session)
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Unable to generate LiveKit token.",
        )

    # 8. RETURN LIVEKIT TOKEN
    return {
        "server_url": os.getenv("LIVEKIT_URL"),
        "participant_token": token,
    }

# MEETING HEARTBEAT
@router.post("/heartbeat")
def meeting_heartbeat(
    data: MeetingSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    session = (
        db.query(ActiveMeetingSession)
        .filter(
            ActiveMeetingSession.user_id == current_user.id,
            ActiveMeetingSession.meeting_id == data.meeting_id,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Active meeting session not found.",
        )

    session.last_seen_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Meeting session is active."
    }


# LEAVE MEETING
@router.post("/leave")
def leave_meeting(
    data: MeetingSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    session = (
        db.query(ActiveMeetingSession)
        .filter(
            ActiveMeetingSession.user_id == current_user.id,
            ActiveMeetingSession.meeting_id == data.meeting_id,
        )
        .first()
    )

    if session:
        db.delete(session)
        db.commit()

    return {
        "message": "Meeting session released."
    }
    
@router.get("/active-session")
def get_active_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ActiveMeetingSession)
        .filter(
            ActiveMeetingSession.user_id == current_user.id
        )
        .first()
    )

    if not session:
        return {
            "active": False
        }

    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.meeting_id == session.meeting_id
        )
        .first()
    )

    if not meeting:
        db.delete(session)
        db.commit()

        return {
            "active": False
        }

    return {
        "active": True,
        "meeting_id": meeting.meeting_id,
        "title": meeting.title or "Meeting",
        "joined_at": session.joined_at,
    }