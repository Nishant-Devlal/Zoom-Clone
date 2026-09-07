"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";

import "@livekit/components-styles";

export default function MeetingPage() {
  const params = useParams();

  const meetingId = params.meetingId as string;

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) return;

    async function getToken() {
      try {
        console.log("Meeting ID:", meetingId);

        const response = await fetch(
          "http://127.0.0.1:8000/api/livekit/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              room_name: meetingId,
              participant_name: `user-${crypto.randomUUID()}`,
            }),
          }
        );

        console.log(
          "Token endpoint status:",
          response.status
        );

        const data = await response.json();

        console.log(
          "LiveKit response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.detail || "Token request failed"
          );
        }

        if (!data.participant_token) {
          throw new Error(
            "Backend did not return participant_token"
          );
        }

        if (!data.server_url) {
          throw new Error(
            "Backend did not return server_url"
          );
        }

        console.log(
          "Server URL:",
          data.server_url
        );

        console.log(
          "Token received:",
          Boolean(data.participant_token)
        );

        setToken(data.participant_token);
        setServerUrl(data.server_url);

      } catch (err) {
        console.error(
          "Token error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to join meeting"
        );
      }
    }

    getToken();

  }, [meetingId]);


  if (error) {
    return (
      <div className="meeting-error">
        <h1>Unable to join meeting</h1>
        <p>{error}</p>

        <p>
          Meeting ID: {meetingId}
        </p>
      </div>
    );
  }


  if (!token || !serverUrl) {
    return (
      <div className="meeting-loading">

        <div className="meeting-loader" />

        <h2>
          Joining meeting...
        </h2>

        <p>
          Meeting ID: {meetingId}
        </p>

      </div>
    );
  }


  return (
    <div className="meeting-container">

      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        audio={true}
        video={true}
        className="livekit-room"

        onConnected={() => {
          console.log(
            "================================"
          );

          console.log(
            "✅ CONNECTED TO LIVEKIT"
          );

          console.log(
            "================================"
          );
        }}

        onDisconnected={(reason) => {
          console.log(
            "Disconnected:",
            reason
          );
        }}

        onError={(error) => {
          console.error(
            "❌ LIVEKIT ERROR:",
            error
          );
        }}
      >

        <VideoConference />

      </LiveKitRoom>

    </div>
  );
}