from pydantic import BaseModel


class CreateMeetingRequest(BaseModel):
    title: str = "Instant Meeting"


class MeetingResponse(BaseModel):
    id: int
    meeting_id: str
    host_id: int
    title: str

    class Config:
        from_attributes = True