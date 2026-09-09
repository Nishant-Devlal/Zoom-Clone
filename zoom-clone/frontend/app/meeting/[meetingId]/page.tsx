"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ParticipantPanel from "@/components/ParticipantPanel";
import MeetingInfoModal from "@/components/MeetingInfoModal";
import Navbar from "@/components/Navbar";

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  StartAudio,
  useRoomContext,
  useLocalParticipant,
} from "@livekit/components-react";

import {
  Video,
  ShieldCheck,
  Users,
  Copy,
  Check,
  PhoneOff,
  Lock,
  Unlock,
  Info,
  Home,
  MessageSquare,
  CalendarDays,
  MoreHorizontal,
  Settings,
} from "lucide-react";

import "@livekit/components-styles";


/* MEETING CONTROLS */
function MeetingControls({
  isHost,
  meetingId,
  onEndMeeting,
}: {
  isHost: boolean;
  meetingId: string;
  onEndMeeting: (room: any) => void;
}) {
  const room = useRoomContext();

  const leaveMeeting = async () => {
    try {
      const authToken = localStorage.getItem("access_token");

      if (authToken) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/livekit/leave`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              meeting_id: meetingId,
            }),
          }
        );
      }
    } catch (error) {
      console.error(
        "Failed to release meeting session:",
        error
      );
    } finally {
      await room.disconnect();

      window.location.href = "/";
    }
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

/* MAIN MEETING PAGE */
export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<{
    meeting_id: string;
    title: string;
  } | null>(null);

  const [isHost, setIsHost] = useState(false);
  const [endingMeeting, setEndingMeeting] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("Meeting");
  const [meetingData, setMeetingData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);
  const [lockingMeeting, setLockingMeeting] = useState(false);

  /* INITIALIZE MEETING */
  useEffect(() => {
    if (!meetingId) {
      return;
    }

    let cancelled = false;

    async function initializeMeeting() {
      try {
        /* AUTHENTICATION */
        const authToken = localStorage.getItem("access_token");

        if (!authToken) {
          router.replace("/login");
          return;
        }

        /* GET USER */
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          router.replace("/login");
          return;
        }

        const user = JSON.parse(storedUser);

        /* GET MEETING */
        const meetingResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!meetingResponse.ok) {
          let errorMessage =
            "Meeting not found";

          try {
            const responseData =
              await meetingResponse.json();

            errorMessage =
              responseData.detail ||
              errorMessage;
          } catch {
            // Ignore JSON parsing error
          }

          throw new Error(errorMessage);
        }

        const meeting =
          await meetingResponse.json();

        if (cancelled) {
          return;
        }

        setMeetingData(meeting);

        setMeetingTitle(
          meeting.title || "Meeting"
        );

        setIsMeetingLocked(
          meeting.locked === true
        );

        /* CHECK HOST */
        const host =
          meeting.host_id === user.id;

        setIsHost(host);

        /* START MEETING */
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
            let errorMessage =
              "Unable to start meeting";

            try {
              const data =
                await startResponse.json();

              errorMessage =
                data.detail ||
                errorMessage;
            } catch {
              // Ignore JSON parsing error
            }

            throw new Error(errorMessage);
          }

          console.log(
            "Meeting started successfully"
          );
        }

        /* GET LIVEKIT TOKEN */
        const tokenResponse =
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/livekit/token`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${authToken}`,
              },

              body: JSON.stringify({
                room_name: meetingId,
                participant_name: user.name,
              }),
            }
          );

        const tokenData =
          await tokenResponse.json();

        /* HANDLE TOKEN ERROR */
        if (!tokenResponse.ok) {
          if (
            tokenResponse.status === 409 &&
            tokenData.detail &&
            typeof tokenData.detail === "object"
          ) {
            const detail = tokenData.detail;

            if (detail.meeting_id) {
              setActiveMeeting({
                meeting_id: String(detail.meeting_id),
                title:
                  detail.meeting_title ||
                  "Current Meeting",
              });
            }

            throw new Error(
              detail.message ||
                "You are already in another meeting."
            );
          }

          throw new Error(
            typeof tokenData.detail === "string"
              ? tokenData.detail
              : "Token request failed"
          );
        }

        /* VALIDATE TOKEN */
        if (!tokenData.participant_token) {
          throw new Error(
            "Backend did not return participant token"
          );
        }

        if (!tokenData.server_url) {
          throw new Error(
            "Backend did not return server URL"
          );
        }

        if (cancelled) {
          return;
        }

        /* SAVE LIVEKIT CONNECTION DATA */
        setToken(
          tokenData.participant_token
        );

        setServerUrl(
          tokenData.server_url
        );
      } catch (err) {
        console.error(
          "Meeting initialization error:",
          err
        );

        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to join meeting"
        );
      }
    }

    initializeMeeting();

    return () => {
      cancelled = true;
    };
  }, [meetingId, router]);

  /* Once the LiveKit token exists, tell the backend every
     20 seconds that this user is still inside this meeting */
  useEffect(() => {
    if (!token || !meetingId) {
      return;
    }

    const authToken =
      localStorage.getItem("access_token");

    if (!authToken) {
      return;
    }

    let stopped = false;

    const sendHeartbeat = async () => {
      if (stopped) {
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/livekit/heartbeat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${authToken}`,
            },

            body: JSON.stringify({
              meeting_id: meetingId,
            }),
          }
        );

        if (!response.ok) {
          console.warn(
            "Heartbeat response:",
            response.status
          );
        }
      } catch (error) {
        console.error(
          "Heartbeat failed:",
          error
        );
      }
    };

    /* Send immediately.*/
    sendHeartbeat();

    /* Then every 20 seconds */
    const interval = setInterval(
      sendHeartbeat,
      20_000
    );

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [token, meetingId]);

  /* Release session when tab/browser closes or user used the browser back button.
     Switching tabs does NOT release the session. */
  useEffect(() => {
    if (!token || !meetingId) {
      return;
    }

    const releaseSession = () => {
      const authToken =
        localStorage.getItem("access_token");

      if (!authToken) {
        return;
      }

      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/livekit/leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            meeting_id: meetingId,
          }),
          keepalive: true,
        }
      ).catch((error) => {
        console.error(
          "Failed to release meeting session:",
          error
        );
      });
    };

    const handlePageHide = () => {
      releaseSession();
    };

    const handlePopState = () => {
      releaseSession();
    };

    window.addEventListener(
      "pagehide",
      handlePageHide
    );

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "pagehide",
        handlePageHide
      );

      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [token, meetingId]);

  /* Used when the user leaves the meeting through the app
     navigation/sidebar. Normal tab switching does NOT call
     this function, so the meeting stays active.*/
  const leaveAndNavigate = async (
    destination: string
  ) => {
    try {
      const authToken =
        localStorage.getItem("access_token");

      if (authToken && meetingId) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/livekit/leave`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              meeting_id: meetingId,
            }),
            keepalive: true,
          }
        );
      }
    } catch (error) {
      console.error(
        "Failed to release meeting session before navigation:",
        error
      );
    } finally {
      router.push(destination);
    }
  };

  /* COPY INVITATION */
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

  /* LOCK / UNLOCK MEETING */
  const toggleMeetingLock = async () => {
    if (!isHost || lockingMeeting) {
      return;
    }

    try {
      const authToken = localStorage.getItem("access_token");

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
            Authorization:
              `Bearer ${authToken}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update meeting lock"
        );
      }

      setIsMeetingLocked(
        data.locked === true
      );

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

  /* END MEETING
     Only the host can reach this function.
     The backend deletes all active sessions for this meeting */
  const endMeeting = async (room: any) => {
    if (!isHost || endingMeeting) {
      return;
    }

    const confirmed =
      window.confirm(
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
            Authorization:
              `Bearer ${authToken}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to end meeting"
        );
      }

      console.log(
        "Meeting ended:",
        data
      );

      /* The backend has already marked meeting as ended, removed active meeting sessions
       and deleted the LiveKit room.
       Now disconnect this browser. */
      await room.disconnect();

      router.push("/");
    } catch (error) {
      console.error(
        "End meeting error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to end meeting"
      );

      setEndingMeeting(false);
    }
  };

  /* ERROR SCREEN */
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

          {activeMeeting ? (
            <div className="active-meeting-card">
              <span className="active-meeting-label">
                You are currently in:
              </span>

              <strong className="active-meeting-title">
                {activeMeeting.title}
              </strong>

              <span className="active-meeting-id">
                Meeting ID: {activeMeeting.meeting_id}
              </span>

              <button
                type="button"
                className="active-meeting-return"
                onClick={() =>
                  router.push(
                    `/meeting/${activeMeeting.meeting_id}`
                  )
                }
              >
                Return to Meeting
              </button>
            </div>
          ) : (
            <span>
              Meeting ID: {meetingId}
            </span>
          )}

          <button
            type="button"
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

  /* LOADING SCREEN */
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

  /* MEETING ROOM */
  return (
    <div className="zoom-meeting-workspace">

      <Navbar />

      <div className="zoom-meeting-workspace-body">

        {/* SIDEBAR */}
        <aside className="zoom-meeting-sidebar">
          <nav className="zoom-meeting-sidebar-nav">

            {/* HOME */}
            <button
              type="button"
              className="zoom-meeting-sidebar-item"
              onClick={() =>
                leaveAndNavigate("/")
              }
              title="Home"
            >
              <Home
                size={21}
                strokeWidth={1.8}
              />

              <span>
                Home
              </span>
            </button>

            {/* MEETINGS */}

            <button
              type="button"
              className="zoom-meeting-sidebar-item active"
              onClick={() =>
                leaveAndNavigate("/meetings")
              }
              title="Meetings"
            >
              <CalendarDays
                size={21}
                strokeWidth={1.8}
              />

              <span>
                Meetings
              </span>
            </button>

            {/* CHAT */}

            <button
              type="button"
              className="zoom-meeting-sidebar-item"
              onClick={() =>
                leaveAndNavigate("/chat")
              }
              title="Chat"
            >
              <MessageSquare
                size={21}
                strokeWidth={1.8}
              />

              <span>
                Chat
              </span>
            </button>

            {/* MORE */}

            <button
              type="button"
              className="zoom-meeting-sidebar-item"
              title="More"
              onClick={() => {}}
            >
              <MoreHorizontal
                size={21}
                strokeWidth={1.8}
              />

              <span>
                More
              </span>
            </button>

          </nav>

          {/* SETTINGS */}

          <button
            type="button"
            className="zoom-meeting-sidebar-item zoom-meeting-sidebar-settings"
            onClick={() =>
              router.push("/settings")
            }
            title="Settings"
          >
            <Settings
              size={21}
              strokeWidth={1.8}
            />

            <span>
              Settings
            </span>
          </button>

        </aside>

        {/* MAIN MEETING AREA */}
        <main className="zoom-meeting-main">

          {/* TOP BAR */}
          <header className="meeting-topbar">

            <div className="meeting-topbar-left">

              <div className="meeting-brand">

                <div className="meeting-brand-icon">
                  <Video size={19} />
                </div>

                <span>
                  Zoom
                </span>

              </div>

              <div className="meeting-divider" />

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

            {/* TOP RIGHT CONTROLS */}
            <div className="meeting-topbar-right">

              {/* SECURITY */}
              {isHost ? (

                <button
                  type="button"
                  className="secure-badge"
                  onClick={
                    toggleMeetingLock
                  }
                  disabled={
                    lockingMeeting
                  }
                  title={
                    isMeetingLocked
                      ? "Unlock meeting"
                      : "Lock meeting"
                  }
                >

                  {isMeetingLocked ? (
                    <Unlock size={15} />
                  ) : (
                    <ShieldCheck
                      size={15}
                    />
                  )}

                  {lockingMeeting
                    ? "Updating..."
                    : isMeetingLocked
                    ? "Locked"
                    : "Secure"}

                </button>

              ) : (

                <div className="secure-badge">

                  <ShieldCheck
                    size={15}
                  />

                  Secure

                </div>

              )}

              {/* PARTICIPANTS */}
              <button
                className="meeting-participants-button"
                onClick={() =>
                  setShowParticipants(
                    !showParticipants
                  )
                }
              >

                <Users size={16} />

                Participants

              </button>

              {/* INFO */}
              <button
                type="button"
                className="meeting-info-button"
                onClick={() =>
                  setShowMeetingInfo(
                    true
                  )
                }
                title="Meeting information"
              >

                <Info size={16} />

                Info

              </button>

              {/* INVITE */}
              <button
                className="invite-button"
                onClick={
                  copyInvitation
                }
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

          {/* LIVEKIT MEETING STAGE */}
          <div className="meeting-video-area">

            <LiveKitRoom
              token={token}
              serverUrl={serverUrl}
              connect={true}
              audio={true}
              video={true}
              className="custom-livekit-room"

              onConnected={() => {
                console.log(
                  "CONNECTED TO LIVEKIT"
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
                  "LIVEKIT ERROR:",
                  error
                );
              }}
            >

              <VideoConference />

              {showParticipants && (
                <ParticipantPanel
                  isHost={isHost}
                  onClose={() =>
                    setShowParticipants(
                      false
                    )
                  }
                />
              )}

              {/* MEETING INFO MODAL */}
              {showMeetingInfo && (
                <MeetingInfoModal
                  meetingTitle={meetingTitle}
                  meetingId={meetingId}
                  meetingLocked={isMeetingLocked}
                  startedAt={meetingData?.started_at}
                  endedAt={meetingData?.ended_at}
                  isHost={isHost}
                  onClose={() =>
                    setShowMeetingInfo(
                      false
                    )
                  }
                />
              )}

              {/* MEETING EXIT CONTROLS */}
              <MeetingControls
                isHost={isHost}
                meetingId={meetingId}
                onEndMeeting={
                  endMeeting
                }
              />

            </LiveKitRoom>

          </div>

        </main>

      </div>

    </div>
  );
}