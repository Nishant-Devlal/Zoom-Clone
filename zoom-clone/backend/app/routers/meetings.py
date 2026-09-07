import random

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.models.user import User
from app.schemas.meeting import (
    CreateMeetingRequest,
    ScheduleMeetingRequest,
    MeetingResponse,
)
from app.utils.security import get_current_user
from app.services.livekit_service import delete_livekit_room
from app.services.livekit_service import remove_livekit_participant

router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"]
)


# ---------------------------------------
# MEETING ID GENERATION
# ---------------------------------------

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
    now = datetime.now(timezone.utc)

    meetings = (
        db.query(Meeting)
        .filter(Meeting.host_id == current_user.id)
        .filter(Meeting.scheduled_at != None)
        .filter(Meeting.scheduled_at >= now)
        .filter(Meeting.ended_at == None)
        .order_by(Meeting.scheduled_at.asc())
        .all()
    )

    return meetings


# ---------------------------------------
# GET PREVIOUS MEETINGS
# ---------------------------------------

@router.get(
    "/previous/list",
    response_model=list[MeetingResponse]
)
def get_previous_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meetings = (
        db.query(Meeting)
        .filter(Meeting.host_id == current_user.id)
        .filter(Meeting.ended_at != None)
        .order_by(Meeting.ended_at.desc())
        .all()
    )

    return meetings


# ---------------------------------------
# START MEETING
# ---------------------------------------

@router.post(
    "/{meeting_id}/start",
    response_model=MeetingResponse
)
def start_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    # Only the host can start the meeting
    if meeting.host_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the host can start this meeting"
        )

    # Don't overwrite the original start time
    if meeting.started_at is None:
        meeting.started_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(meeting)

    return meeting


# ---------------------------------------
# END MEETING
# ---------------------------------------

@router.post("/{meeting_id}/end", response_model=MeetingResponse)
async def end_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    # Only host can end the meeting
    if meeting.host_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the host can end this meeting",
        )

    # Already ended
    if meeting.ended_at is not None:
        return meeting

    # Mark meeting as ended in PostgreSQL
    meeting.ended_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(meeting)

    # Delete LiveKit room and disconnect everyone
    try:
        await delete_livekit_room(meeting.meeting_id)
    except Exception as e:
        print("LiveKit room deletion failed:", e)

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
    db: Session = Depends(get_db),
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


@router.get("/{meeting_id}")
@router.post("/{meeting_id}/remove-participant")
async def remove_participant(
    meeting_id: str,
    participant_identity: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = (
        db.query(Meeting)
        .filter(Meeting.meeting_id == meeting_id)
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    # Only the host can remove participants
    if meeting.host_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the host can remove participants",
        )

    # Don't allow host to remove themselves
    if participant_identity == current_user.name:
        raise HTTPException(
            status_code=400,
            detail="Host cannot remove themselves",
        )

    try:
        await remove_livekit_participant(
            room_name=meeting.meeting_id,
            participant_identity=participant_identity,
        )

        return {
            "message": "Participant removed successfully",
            "participant_identity": participant_identity,
        }

    except Exception as e:
        print("Failed to remove participant:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )