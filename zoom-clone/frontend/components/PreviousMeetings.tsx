"use client";

import { useEffect, useState } from "react";
import { Clock, Copy, Check } from "lucide-react";

interface Meeting {
  id: number;
  meeting_id: string;
  host_id: number;
  title: string;
  scheduled_at: string | null;
}

export default function PreviousMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPreviousMeetings = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setMeetings([]);
        return;
      }

      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/api/meetings/previous/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch previous meetings");
      }

      const data = await response.json();

      setMeetings(data);
    } catch (error) {
      console.error("Previous meetings error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousMeetings();
  }, []);

  const copyMeetingId = async (meetingId: string) => {
    try {
      await navigator.clipboard.writeText(meetingId);

      setCopiedId(meetingId);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  if (loading) {
    return (
      <section className="meetings-section">
        <div className="section-header">
          <h2>Previous Meetings</h2>
        </div>

        <div className="empty-meetings">
          Loading meetings...
        </div>
      </section>
    );
  }

  return (
    <section className="meetings-section">
      <div className="section-header">
        <div>
          <h2>Previous Meetings</h2>
          <p>Your recently completed meetings</p>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="empty-meetings">
          <Clock size={32} />

          <h3>No previous meetings</h3>

          <p>
            Meetings you host will appear here after they are completed.
          </p>
        </div>
      ) : (
        <div className="meetings-list">
          {meetings.map((meeting) => {
            const date = meeting.scheduled_at
              ? new Date(meeting.scheduled_at)
              : null;

            return (
              <div
                className="meeting-card"
                key={meeting.id}
              >
                <div className="meeting-card-icon">
                  <Clock size={20} />
                </div>

                <div className="meeting-card-info">
                  <h3>{meeting.title}</h3>

                  {date && (
                    <p>
                      {date.toLocaleDateString([], {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}

                      {" • "}

                      {date.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}

                  <span>
                    Meeting ID: {meeting.meeting_id}
                  </span>
                </div>

                <button
                  className="copy-meeting-button"
                  onClick={() =>
                    copyMeetingId(meeting.meeting_id)
                  }
                >
                  {copiedId === meeting.meeting_id ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy ID
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}