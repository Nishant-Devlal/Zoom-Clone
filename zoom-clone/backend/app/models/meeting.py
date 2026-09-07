from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from app.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    meeting_id = Column(
        String(20),
        unique=True,
        index=True,
        nullable=False
    )

    host_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(
        String(200),
        nullable=False,
        default="Instant Meeting"
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )