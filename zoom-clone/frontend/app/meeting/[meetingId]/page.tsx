"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ParticipantPanel from "@/components/ParticipantPanel";
import MeetingInfoModal from "@/components/MeetingInfoModal";

import {
  LiveKitRoom,
  VideoConference,
  useRoomContext,
} from "@livekit/components-react";

import {
  Video,
  ShieldCheck,
  Users,
  Copy,
  Check,
  PhoneOff,
  Shield,
  Lock,
  Unlock,
  Info,
} from "lucide-react";

import "@livekit/components-styles";

function MeetingControls({
  isHost,
  onEndMeeting,
}: {
  isHost: boolean;
  onEndMeeting: (room: any) => void;
}) {
  const room = useRoomContext();

  const leaveMeeting = async () => {
    await room.disconnect();
    window.location.href = "/";
  };

  const handleEndMeeting = () => {
    onEndMeeting(room);
  };

  return (
    <div className="meeting-exit-controls">
      {isHost ? (
        <button
          className="host-end-meeting"
          onClick={handleEndMeeting}
        >
          <PhoneOff size={18} />
          End Meeting
        </button>
      ) : (
        <button
          className="participant-leave-meeting"
          onClick={leaveMeeting}
        >
          <PhoneOff size={18} />
          Leave Meeting
        </button>
      )}
    </div>
  );
}

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();

  const meetingId = params.meetingId as string;

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isHost, setIsHost] = useState(false);
  const [endingMeeting, setEndingMeeting] = useState(false);

  const [meetingTitle, setMeetingTitle] = useState("Meeting");
  const [meetingData, setMeetingData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);
  const [lockingMeeting, setLockingMeeting] = useState(false);


  // ---------------------------------------
  // INITIALIZE MEETING
  // ---------------------------------------

  useEffect(() => {
    if (!meetingId) return;

    async function initializeMeeting() {
      try {
        // ---------------------------------------
        // AUTHENTICATION
        // ---------------------------------------

        const authToken =
          localStorage.getItem("access_token");

        if (!authToken) {
          router.replace("/login");
          return;
        }

        // ---------------------------------------
        // GET USER
        // ---------------------------------------

        const storedUser =
          localStorage.getItem("user");

        if (!storedUser) {
          router.replace("/login");
          return;
        }

        const user = JSON.parse(storedUser);

        // ---------------------------------------
        // GET MEETING
        // ---------------------------------------

        const meetingResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!meetingResponse.ok) {
          throw new Error("Meeting not found");
        }

        const meeting =
          await meetingResponse.json();

        setMeetingData(meeting);

        setMeetingTitle(
          meeting.title || "Meeting"
        );

        setIsMeetingLocked(
          meeting.locked === true
        );

        // ---------------------------------------
        // CHECK HOST
        // ---------------------------------------

        const host =
          meeting.host_id === user.id;

        setIsHost(host);

        // ---------------------------------------
        // START MEETING
        // ---------------------------------------

        if (host) {
          const startResponse =
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}/start`,
              {
                method: "POST",
                headers: {
                  Authorization:
                    `Bearer ${authToken}`,
                },
              }
            );

          if (!startResponse.ok) {
            const data =
              await startResponse.json();

            throw new Error(
              data.detail ||
                "Unable to start meeting"
            );
          }

          console.log(
            "Meeting started successfully"
          );
        }

        // ---------------------------------------
        // GET LIVEKIT TOKEN
        // ---------------------------------------

        const response = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/api/livekit/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            room_name: meetingId,
            participant_name: user.name,
          }),
        }
      );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Token request failed"
          );
        }

        if (!data.participant_token) {
          throw new Error(
            "Backend did not return participant token"
          );
        }

        if (!data.server_url) {
          throw new Error(
            "Backend did not return server URL"
          );
        }

        setToken(
          data.participant_token
        );

        setServerUrl(
          data.server_url
        );

      } catch (err) {
        console.error(
          "Meeting initialization error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to join meeting"
        );
      }
    }

    initializeMeeting();

  }, [meetingId, router]);


  // ---------------------------------------
  // COPY INVITATION
  // ---------------------------------------

  const copyInvitation = async () => {
    const meetingLink =
      `${window.location.origin}/meeting/${meetingId}`;

    const invitation =
      `You are invited to a meeting.
      Meeting: ${meetingTitle}
      Meeting ID: ${meetingId}
      Join meeting:
      ${meetingLink}`;

    try {
      await navigator.clipboard.writeText(
        invitation
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

// ---------------------------------------
// LOCK / UNLOCK MEETING
// ---------------------------------------

const toggleMeetingLock = async () => {
  if (!isHost || lockingMeeting) {
    return;
  }

  try {
    const authToken =
      localStorage.getItem("access_token");

    if (!authToken) {
      router.replace("/login");
      return;
    }

    setLockingMeeting(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}/lock`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          "Unable to update meeting lock"
      );
    }

    setIsMeetingLocked(data.locked === true);

    console.log(
      data.locked
        ? "Meeting locked"
        : "Meeting unlocked"
    );

  } catch (error) {
    console.error(
      "Meeting lock error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Unable to update meeting lock"
    );

  } finally {
    setLockingMeeting(false);
  }
};

  // ---------------------------------------
  // END MEETING
  // ---------------------------------------

  const endMeeting = async (room: any) => {
    if (!isHost || endingMeeting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to end this meeting for everyone?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setEndingMeeting(true);

      const authToken =
        localStorage.getItem("access_token");

      if (!authToken) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to end meeting"
        );
      }

      console.log("Meeting ended:", data);

      // Disconnect host from LiveKit
      await room.disconnect();

      // Return to dashboard
      router.push("/");

    } catch (error) {
      console.error("End meeting error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to end meeting"
      );

      setEndingMeeting(false);
    }
  };

  <MeetingControls 
  isHost={isHost}
  onEndMeeting={endMeeting}
  />


  // ---------------------------------------
  // ERROR
  // ---------------------------------------

  if (error) {
    return (
      <div className="meeting-error-screen">

        <div className="meeting-error-card">

          <div className="meeting-error-icon">
            <Video size={30} />
          </div>

          <h1>
            Unable to join meeting
          </h1>

          <p>{error}</p>

          <span>
            Meeting ID: {meetingId}
          </span>

          <button
            onClick={() =>
              router.push("/")
            }
          >
            Back to Home
          </button>

        </div>

      </div>
    );
  }


  // ---------------------------------------
  // LOADING
  // ---------------------------------------

  if (!token || !serverUrl) {
    return (
      <div className="meeting-loading-screen">

        <div className="meeting-loading-logo">
          <Video size={24} />
        </div>

        <div className="meeting-loader" />

        <h2>
          Joining meeting...
        </h2>

        <p>
          {meetingTitle}
        </p>

        <span>
          Meeting ID: {meetingId}
        </span>

      </div>
    );
  }


  // ---------------------------------------
  // MEETING ROOM
  // ---------------------------------------

  return (
    <div className="zoom-meeting-container">

      {/* =====================================
          TOP BAR
      ===================================== */}

      <header className="meeting-topbar">

        <div className="meeting-topbar-left">

          <div className="meeting-brand">
            <div className="meeting-brand-icon">
              <Video size={19} />
            </div>

            <span>
              Zoom Clone
            </span>
          </div>

          <div className="meeting-info">
            <strong>
              {meetingTitle}
            </strong>

            <span>
              ID: {meetingId}
            </span>

            {isMeetingLocked && (
              <span className="meeting-locked-indicator">
                <Lock size={12} />
                Locked
              </span>
            )}
          </div>

        </div>


        <div className="meeting-topbar-right">

          {isHost ? (
            <button
              type="button"
              className="secure-badge"
              onClick={toggleMeetingLock}
              disabled={lockingMeeting}
              title={
                isMeetingLocked
                  ? "Unlock meeting"
                  : "Lock meeting"
              }
            >
              {isMeetingLocked ? (
                <Unlock size={15} />
              ) : (
                <ShieldCheck size={15} />
              )}

              {lockingMeeting
                ? "Updating..."
                : isMeetingLocked
                ? "Locked"
                : "Secure"}
            </button>
          ) : (
            <div className="secure-badge">
              <ShieldCheck size={15} />
              Secure
            </div>
          )}

          <button
            className="meeting-participants-button"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users size={16} />
            Participants
          </button>

          <button
            type="button"
            className="meeting-info-button"
            onClick={() =>
              setShowMeetingInfo(true)
            }
            title="Meeting information"
          >
            <Info size={16} />
            Info
          </button>

          <button
            className="invite-button"
            onClick={copyInvitation}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Invite
              </>
            )}
          </button>

        </div>

      </header>


      {/* =====================================
          LIVEKIT ROOM
      ===================================== */}

      <div className="meeting-video-area">

        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          audio={true}
          video={true}
          className="custom-livekit-room"

          onConnected={() => {
            console.log("CONNECTED TO LIVEKIT");
          }}

          onDisconnected={(reason) => {
            console.log("Disconnected:", reason);
          }}

          onError={(error) => {
            console.error("LIVEKIT ERROR:", error);
          }}
        >
          <VideoConference />

          {showParticipants && (
            <ParticipantPanel
              isHost={isHost}
              onClose={() => setShowParticipants(false)}
            />
          )}

          {showMeetingInfo && (
            <MeetingInfoModal
              meetingTitle={meetingTitle}
              meetingId={meetingId}
              meetingLocked={isMeetingLocked}
              startedAt={meetingData?.started_at}
              endedAt={meetingData?.ended_at}
              isHost={isHost}
              onClose={() =>
                setShowMeetingInfo(false)
              }
            />
          )}

          <MeetingControls
            isHost={isHost}
            onEndMeeting={endMeeting}
          />
        </LiveKitRoom>

      </div>


      

    </div>
  );
}