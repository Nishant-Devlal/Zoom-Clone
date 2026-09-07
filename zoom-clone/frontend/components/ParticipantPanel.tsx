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

  const getParticipantName = (participant: any) => {
    return (
      participant.name ||
      participant.identity ||
      "Participant"
    );
  };

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

  const isMicrophoneEnabled = (participant: any) => {
    const publication = participant.getTrackPublication(
      "microphone"
    );

    return publication?.isSubscribed !== false &&
      publication?.isMuted !== true;
  };

  const isCameraEnabled = (participant: any) => {
    const publication = participant.getTrackPublication(
      "camera"
    );

    return publication?.isSubscribed !== false &&
      publication?.isMuted !== true;
  };

  return (
    <aside className="participant-panel">

      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}

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


      {/* ------------------------------------------------ */}
      {/* INVITE */}
      {/* ------------------------------------------------ */}

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


      {/* ------------------------------------------------ */}
      {/* PARTICIPANT LIST */}
      {/* ------------------------------------------------ */}

      <div className="participant-list">

        {participants.map((participant) => {

          const name = getParticipantName(participant);

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

              {/* Avatar */}

              <div className="participant-avatar">
                {getInitials(name)}
              </div>


              {/* Name */}

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


              {/* Controls */}

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

                {/* Host menu */}

                {isHost && !isLocal && (
                  <button
                    className="participant-more-button"
                    title="Participant options"
                  >
                    <MoreVertical size={17} />
                  </button>
                )}

              </div>

            </div>
          );
        })}

      </div>


      {/* ------------------------------------------------ */}
      {/* HOST CONTROLS */}
      {/* ------------------------------------------------ */}

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