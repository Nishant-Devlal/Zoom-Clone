import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meeting import Meeting
from app.schemas.meeting import (
    CreateMeetingRequest,
    MeetingResponse,
)

router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"],
)


def generate_meeting_id():
    return str(
        random.randint(100000000, 999999999)
    )


@router.post(
    "",
    response_model=MeetingResponse
)
def create_meeting(
    data: CreateMeetingRequest,
    db: Session = Depends(get_db),
):

    while True:
        meeting_id = generate_meeting_id()

        existing = (
            db.query(Meeting)
            .filter(
                Meeting.meeting_id == meeting_id
            )
            .first()
        )

        if not existing:
            break

    meeting = Meeting(
        meeting_id=meeting_id,
        host_id=1,
        title=data.title,
    )

    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return meeting