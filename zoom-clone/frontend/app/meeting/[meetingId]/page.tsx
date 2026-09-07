"use client";

import { useParams } from "next/navigation";

export default function MeetingPage() {
  const params = useParams();
  const meetingId = params.meetingId;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111111",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "20px 30px",
          borderBottom: "1px solid #333",
        }}
      >
        <h2>Zoom Meeting</h2>
        <p style={{ color: "#aaa" }}>
          Meeting ID: {meetingId}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#333",
              margin: "0 auto 20px",
            }}
          />

          <h1>You are the only one here</h1>

          <p style={{ color: "#aaa", marginTop: 10 }}>
            Waiting for other participants to join...
          </p>
        </div>
      </div>

      <div
        style={{
          height: 80,
          background: "#181818",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
        }}
      >
        <button>🎤 Mute</button>
        <button>📹 Stop Video</button>
        <button>🖥 Share Screen</button>
        <button style={{ background: "#d93025", color: "white" }}>
          Leave
        </button>
      </div>
    </main>
  );
}