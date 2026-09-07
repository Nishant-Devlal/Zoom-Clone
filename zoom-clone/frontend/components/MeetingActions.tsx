"use client";

import { useRouter } from "next/navigation";

export default function MeetingActions() {
  const router = useRouter();

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

      router.push(
        `/meeting/${meeting.meeting_id}`
      );

    } catch (error) {
      console.error(error);
      alert("Unable to create meeting");
    }
  };

  return (
    <div className="meeting-actions">

      <button onClick={createMeeting}>
        New Meeting
      </button>

      <button>
        Join
      </button>

      <button>
        Schedule
      </button>

    </div>
  );
}