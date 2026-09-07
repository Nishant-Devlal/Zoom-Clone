"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Plus,
  CalendarDays,
  X,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function MeetingActions() {
  const router = useRouter();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");


  const createMeeting = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/api/meetings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "Instant Meeting",
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.detail || "Failed to create meeting"
        );
      }

      const meeting = await response.json();

      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (error) {
      console.error("Create meeting error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to create meeting"
      );
    }
  };

  const joinMeeting = async () => {
    const cleanedId = meetingId.replace(/\s/g, "");

    if (!cleanedId) {
      setJoinError("Please enter a meeting ID.");
      return;
    }

    if (!/^\d+$/.test(cleanedId)) {
      setJoinError("Meeting ID must contain only numbers.");
      return;
    }

    try {
      setJoinError("");

      /*
       * Check whether the meeting exists in our database.
       *
       * We will add this endpoint to the backend next.
       */
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${cleanedId}`
      );

      if (response.status === 404) {
        setJoinError("Meeting not found. Please check the meeting ID.");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to verify meeting");
      }

      router.push(`/meeting/${cleanedId}`);
    } catch (error) {
      console.error("Join meeting error:", error);
      setJoinError("Unable to connect to the server.");
    }
  };

  const scheduleMeeting = async () => {
    if (!scheduleTitle.trim()) {
      setScheduleError("Please enter a meeting title.");
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      setScheduleError("Please select a date and time.");
      return;
    }

    const scheduledAt = `${scheduleDate}T${scheduleTime}:00`;

    try {
      setScheduleError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/api/meetings/schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: scheduleTitle.trim(),
            scheduled_at: scheduledAt,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to schedule meeting"
        );
      }

      setScheduleSuccess(
        `Meeting scheduled successfully. Meeting ID: ${data.meeting_id}`
      );

      setScheduleTitle("");
      setScheduleDate("");
      setScheduleTime("");

      window.dispatchEvent(
        new Event("meeting-scheduled")
      );
    } catch (error) {
      console.error("Schedule error:", error);

      setScheduleError(
        error instanceof Error
          ? error.message
          : "Unable to schedule meeting."
      );
    }
  };

  return (
    <>
      <div className="meeting-actions">

        {/* New Meeting */}
        <button
          className="meeting-action primary"
          onClick={createMeeting}
        >
          <span className="action-icon">
            <Video size={22} />
          </span>

          <span>
            <strong>New Meeting</strong>
            <small>Start an instant meeting</small>
          </span>
        </button>

        {/* Join Meeting */}
        <button
          className="meeting-action"
          onClick={() => {
            setShowJoinModal(true);
            setJoinError("");
          }}
        >
          <span className="action-icon">
            <Plus size={22} />
          </span>

          <span>
            <strong>Join</strong>
            <small>Join a meeting</small>
          </span>
        </button>

        {/* Schedule */}
        <button
          className="meeting-action"
          onClick={() => {
            setShowScheduleModal(true);
            setScheduleError("");
            setScheduleSuccess("");
          }}
        >
          <span className="action-icon">
            <CalendarDays size={22} />
          </span>

          <span>
            <strong>Schedule</strong>
            <small>Schedule a meeting</small>
          </span>
        </button>
      </div>

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <div
          className="join-modal-overlay"
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="join-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="join-modal-close"
              onClick={() => setShowJoinModal(false)}
            >
              <X size={20} />
            </button>

            <div className="join-modal-icon">
              <Video size={26} />
            </div>

            <h2>Join Meeting</h2>

            <p className="join-modal-description">
              Enter the meeting ID provided by the host.
            </p>

            <label>Meeting ID</label>

            <input
              type="text"
              value={meetingId}
              onChange={(event) => {
                setMeetingId(event.target.value);
                setJoinError("");
              }}
              placeholder="Enter meeting ID"
              maxLength={11}
              autoFocus
            />

            {joinError && (
              <p className="join-error">
                {joinError}
              </p>
            )}

            <button
              className="join-submit"
              onClick={joinMeeting}
            >
              Join Meeting
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div
          className="join-modal-overlay"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="join-modal schedule-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="join-modal-close"
              onClick={() => setShowScheduleModal(false)}
            >
              <X size={20} />
            </button>

            <div className="join-modal-icon">
              <CalendarDays size={26} />
            </div>

            <h2>Schedule Meeting</h2>

            <p className="join-modal-description">
              Schedule a meeting for a future date and time.
            </p>

            <label>Meeting Title</label>

            <input
              type="text"
              value={scheduleTitle}
              onChange={(event) => {
                setScheduleTitle(event.target.value);
                setScheduleError("");
              }}
              placeholder="Enter meeting title"
            />

            <label className="schedule-label">
              Date
            </label>

            <input
              type="date"
              value={scheduleDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(event) => {
                setScheduleDate(event.target.value);
                setScheduleError("");
              }}
            />

            <label className="schedule-label">
              Time
            </label>

            <input
              type="time"
              value={scheduleTime}
              onChange={(event) => {
                setScheduleTime(event.target.value);
                setScheduleError("");
              }}
            />

            {scheduleError && (
              <p className="join-error">
                {scheduleError}
              </p>
            )}

            {scheduleSuccess && (
              <p className="schedule-success">
                {scheduleSuccess}
              </p>
            )}

            <button
              className="join-submit"
              onClick={scheduleMeeting}
            >
              Schedule Meeting
              <Clock size={18} />
            </button>
          </div>
        </div>
      )}

    </>
  );
}

