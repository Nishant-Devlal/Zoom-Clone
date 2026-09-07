from datetime import datetime
from pydantic import BaseModel


class CreateMeetingRequest(BaseModel):
    title: str = "Instant Meeting"


class ScheduleMeetingRequest(BaseModel):
    title: str
    scheduled_at: datetime


class MeetingResponse(BaseModel):
    id: int
    meeting_id: str
    host_id: int
    title: str
    scheduled_at: datetime | None = None
    created_at: datetime | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None

    class Config:
        from_attributes = True