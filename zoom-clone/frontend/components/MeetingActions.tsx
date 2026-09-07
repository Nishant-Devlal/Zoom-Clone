"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Plus,
  CalendarDays,
  X,
  ArrowRight,
} from "lucide-react";

export default function MeetingActions() {
  const router = useRouter();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [joinError, setJoinError] = useState("");

  const createMeeting = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/meetings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Instant Meeting",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create meeting");
      }

      const meeting = await response.json();

      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (error) {
      console.error("Create meeting error:", error);
      alert("Unable to create meeting");
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
        `http://127.0.0.1:8000/api/meetings/${cleanedId}`
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
            alert("Schedule Meeting coming next.");
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
    </>
  );
}

