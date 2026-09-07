"use client";

import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";

import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MoreVertical,
  UserPlus,
} from "lucide-react";

import { useState } from "react";

interface ParticipantPanelProps {
  onClose: () => void;
  isHost: boolean;
}

export default function ParticipantPanel({
  onClose,
  isHost,
}: ParticipantPanelProps) {
  const participants = useParticipants();

  const { localParticipant } = useLocalParticipant();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // ------------------------------------------------
  // GET PARTICIPANT NAME
  // ------------------------------------------------

  const getParticipantName = (participant: any) => {
    return (
      participant.name ||
      participant.identity ||
      "Participant"
    );
  };

  // ------------------------------------------------
  // GET INITIALS
  // ------------------------------------------------

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // ------------------------------------------------
  // MICROPHONE STATUS
  // ------------------------------------------------

  const isMicrophoneEnabled = (participant: any) => {
    const publication =
      participant.getTrackPublication("microphone");

    return (
      publication?.isSubscribed !== false &&
      publication?.isMuted !== true
    );
  };

  // ------------------------------------------------
  // CAMERA STATUS
  // ------------------------------------------------

  const isCameraEnabled = (participant: any) => {
    const publication =
      participant.getTrackPublication("camera");

    return (
      publication?.isSubscribed !== false &&
      publication?.isMuted !== true
    );
  };

  // ------------------------------------------------
  // REMOVE PARTICIPANT
  // ------------------------------------------------

  const removeParticipant = async (
    participantIdentity: string,
    participantName: string
  ) => {
    const confirmed = window.confirm(
      `Remove ${participantName} from this meeting?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemoving(participantIdentity);
      setOpenMenu(null);

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        alert("You are not logged in.");
        return;
      }

      // Get meeting ID from URL
      const meetingId =
        window.location.pathname.split("/").pop();

      if (!meetingId) {
        alert("Meeting ID not found.");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/meetings/${meetingId}/remove-participant`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
            participant_identity:
              participantIdentity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to remove participant"
        );
      }

      console.log(
        "Participant removed:",
        data
      );

    } catch (error) {
      console.error(
        "Remove participant error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to remove participant"
      );
    } finally {
      setRemoving(null);
    }
  };

  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <aside className="participant-panel">

      {/* ============================================
          HEADER
      ============================================ */}

      <div className="participant-panel-header">

        <div>
          <h2>Participants</h2>

          <span>
            {participants.length}{" "}
            {participants.length === 1
              ? "participant"
              : "participants"}
          </span>
        </div>

        <button
          className="participant-close-button"
          onClick={onClose}
          aria-label="Close participants"
        >
          <X size={20} />
        </button>

      </div>


      {/* ============================================
          INVITE
      ============================================ */}

      <div className="participant-invite-section">

        <button
          className="participant-invite-button"
          onClick={() => {
            navigator.clipboard.writeText(
              window.location.href
            );
          }}
        >
          <UserPlus size={17} />
          Invite
        </button>

      </div>


      {/* ============================================
          PARTICIPANT LIST
      ============================================ */}

      <div className="participant-list">

        {participants.map((participant) => {

          const name =
            getParticipantName(participant);

          const isLocal =
            participant.identity ===
            localParticipant.identity;

          const microphoneEnabled =
            isMicrophoneEnabled(participant);

          const cameraEnabled =
            isCameraEnabled(participant);

          return (
            <div
              key={participant.identity}
              className="participant-item"
            >

              {/* --------------------------------------
                  AVATAR
              -------------------------------------- */}

              <div className="participant-avatar">
                {getInitials(name)}
              </div>


              {/* --------------------------------------
                  NAME
              -------------------------------------- */}

              <div className="participant-info">

                <div className="participant-name">

                  <span>
                    {name}
                  </span>

                  {isLocal && (
                    <span className="you-badge">
                      You
                    </span>
                  )}

                  {isHost && isLocal && (
                    <span className="host-badge">
                      Host
                    </span>
                  )}

                </div>

              </div>


              {/* --------------------------------------
                  MEDIA STATUS
              -------------------------------------- */}

              <div className="participant-media-status">

                {microphoneEnabled ? (
                  <Mic size={17} />
                ) : (
                  <MicOff
                    size={17}
                    className="muted-icon"
                  />
                )}

                {cameraEnabled ? (
                  <Video size={17} />
                ) : (
                  <VideoOff
                    size={17}
                    className="muted-icon"
                  />
                )}


                {/* --------------------------------------
                    HOST PARTICIPANT MENU
                -------------------------------------- */}

                {isHost && !isLocal && (

                  <div className="participant-menu-wrapper">

                    {/* Three dots button */}

                    <button
                      type="button"
                      className="participant-more-button"
                      title="Participant options"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        setOpenMenu((current) =>
                          current ===
                          participant.identity
                            ? null
                            : participant.identity
                        );
                      }}
                    >
                      <MoreVertical size={17} />
                    </button>


                    {/* --------------------------------
                        ACTION MENU
                    -------------------------------- */}

                    {openMenu ===
                      participant.identity && (

                      <div className="participant-action-menu">

                        <button
                          type="button"
                          className="participant-remove-action"
                          disabled={
                            removing ===
                            participant.identity
                          }
                          onClick={() =>
                            removeParticipant(
                              participant.identity,
                              name
                            )
                          }
                        >
                          {removing ===
                          participant.identity
                            ? "Removing..."
                            : "Remove Participant"}
                        </button>

                      </div>

                    )}

                  </div>

                )}

              </div>

            </div>
          );
        })}

      </div>


      {/* ============================================
          HOST CONTROLS
      ============================================ */}

      {isHost && (

        <div className="participant-host-controls">

          <button
            className="mute-all-button"
            onClick={() => {
              alert(
                "Mute All will be connected to LiveKit participant controls next."
              );
            }}
          >
            <MicOff size={17} />
            Mute All
          </button>

        </div>

      )}

    </aside>
  );
}