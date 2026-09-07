"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, Copy, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface Meeting {
  id: number;
  meeting_id: string;
  host_id: number;
  title: string;
  scheduled_at: string | null;
}

export default function UpcomingMeetings() {
  const router = useRouter();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/meetings/upcoming/list"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();

      setMeetings(data);
    } catch (error) {
      console.error("Upcoming meetings error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();

    const handleScheduled = () => {
      fetchMeetings();
    };

    window.addEventListener(
      "meeting-scheduled",
      handleScheduled
    );

    return () => {
      window.removeEventListener(
        "meeting-scheduled",
        handleScheduled
      );
    };
  }, []);

  const copyInvitation = async (
    meeting: Meeting
  ) => {
    const link =
      `${window.location.origin}/meeting/${meeting.meeting_id}`;

    const invitation = `
${meeting.title}

Join Meeting:
${link}

Meeting ID: ${meeting.meeting_id}
`;

    await navigator.clipboard.writeText(
      invitation.trim()
    );

    alert("Invitation copied!");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      undefined,
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  if (loading) {
    return (
      <section className="upcoming-section">
        <div className="section-header">
          <h2>Upcoming Meetings</h2>
        </div>

        <div className="upcoming-empty">
          Loading meetings...
        </div>
      </section>
    );
  }

  return (
    <section className="upcoming-section">
      <div className="section-header">
        <div>
          <h2>Upcoming Meetings</h2>

          <p>
            Your scheduled meetings
          </p>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="upcoming-empty">
          <CalendarDays size={34} />

          <h3>No upcoming meetings</h3>

          <p>
            Schedule a meeting to see it here.
          </p>
        </div>
      ) : (
        <div className="upcoming-list">
          {meetings.map((meeting) => (
            <div
              className="upcoming-card"
              key={meeting.id}
            >
              <div className="upcoming-card-main">
                <div className="upcoming-icon">
                  <CalendarDays size={22} />
                </div>

                <div>
                  <h3>{meeting.title}</h3>

                  <div className="meeting-time">
                    <span>
                      <CalendarDays size={15} />
                      {meeting.scheduled_at
                        ? formatDate(
                            meeting.scheduled_at
                          )
                        : ""}
                    </span>

                    <span>
                      <Clock size={15} />
                      {meeting.scheduled_at
                        ? formatTime(
                            meeting.scheduled_at
                          )
                        : ""}
                    </span>
                  </div>

                  <p className="meeting-id">
                    Meeting ID:{" "}
                    {meeting.meeting_id}
                  </p>
                </div>
              </div>

              <div className="upcoming-actions">
                <button
                  className="secondary-meeting-btn"
                  onClick={() =>
                    copyInvitation(meeting)
                  }
                >
                  <Copy size={16} />
                  Copy Invitation
                </button>

                <button
                  className="primary-meeting-btn"
                  onClick={() =>
                    router.push(
                      `/meeting/${meeting.meeting_id}`
                    )
                  }
                >
                  <Play size={16} />
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}