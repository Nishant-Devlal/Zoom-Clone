from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base

class ActiveMeetingSession(Base):
    __tablename__ = "active_meeting_sessions"

    id = Column(Integer, primary_key=True, index=True)

    # One user can have only ONE active meeting
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    # Your public Zoom meeting ID
    meeting_id = Column(
        String,
        nullable=False,
        index=True
    )

    joined_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    last_seen_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )