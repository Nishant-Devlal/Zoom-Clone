import random
from app.models.user import User
from app.utils.security import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.meeting import Meeting
from app.schemas.meeting import (
    CreateMeetingRequest,
    ScheduleMeetingRequest,
    MeetingResponse,
)


router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"]
)


def generate_meeting_id():
    return str(random.randint(100000000, 999999999))


def get_unique_meeting_id(db: Session):
    while True:
        meeting_id = generate_meeting_id()

        existing = (
            db.query(Meeting)
            .filter(Meeting.meeting_id == meeting_id)
            .first()
        )

        if not existing:
            return meeting_id


# ---------------------------------------
# CREATE INSTANT MEETING
# ---------------------------------------

@router.post("", response_model=MeetingResponse)
def create_meeting(
    data: CreateMeetingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting_id = get_unique_meeting_id(db)

    meeting = Meeting(
        meeting_id=meeting_id,
        host_id=current_user.id,
        title=data.title,
        scheduled_at=None,
    )

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return meeting


# ---------------------------------------
# SCHEDULE MEETING
# ---------------------------------------

@router.post("/schedule", response_model=MeetingResponse)
def schedule_meeting(
    data: ScheduleMeetingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting_id = get_unique_meeting_id(db)

    meeting = Meeting(
        meeting_id=meeting_id,
        host_id=current_user.id,
        title=data.title,
        scheduled_at=data.scheduled_at,
    )

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return meeting


# ---------------------------------------
# GET ONE MEETING
# ---------------------------------------

@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse
)
def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )

    return meeting


# ---------------------------------------
# GET UPCOMING MEETINGS
# ---------------------------------------

@router.get(
    "/upcoming/list",
    response_model=list[MeetingResponse]
)
def get_upcoming_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)

    meetings = (
        db.query(Meeting)
        .filter(Meeting.host_id == current_user.id)
        .filter(Meeting.scheduled_at != None)
        .filter(Meeting.scheduled_at >= now)
        .order_by(Meeting.scheduled_at.asc())
        .all()
    )

    return meetings