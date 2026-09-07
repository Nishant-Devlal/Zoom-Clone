"use client";

import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";

import { Track } from "livekit-client";

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
  const [muting, setMuting] = useState<string | null>(null);
  const [mutingAll, setMutingAll] = useState(false);
  const [stoppingVideo, setStoppingVideo] = useState<string | null>(null);


  // =========================================================
  // PARTICIPANT NAME
  // =========================================================

  const getParticipantName = (participant: any) => {
    return (
      participant.name ||
      participant.identity ||
      "Participant"
    );
  };

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // =========================================================
  // MICROPHONE STATUS
  // =========================================================

  const isMicrophoneEnabled = (participant: any) => {
    const publication =
      participant.getTrackPublication("microphone");

    return (
      publication?.isMuted !== true &&
      publication != null
    );
  };

  // =========================================================
  // CAMERA STATUS
  // =========================================================

  const isCameraEnabled = (participant: any) => {
    const publication =
      participant.getTrackPublication("camera");

    return (
      publication?.isMuted !== true &&
      publication != null
    );
  };

  // =========================================================
  // ERROR MESSAGE HELPER
  // =========================================================

  const getErrorMessage = (data: any, fallback: string) => {
    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item: any) => {
          if (typeof item === "string") {
            return item;
          }

          return (
            item?.msg ||
            item?.message ||
            "Invalid request"
          );
        })
        .join(", ");
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    return fallback;
  };

  // =========================================================
  // REMOVE PARTICIPANT
  // =========================================================

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

      const meetingId =
        window.location.pathname.split("/").pop();

      if (!meetingId) {
        alert("Meeting ID not found.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}/remove-participant`,
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
          getErrorMessage(
            data,
            "Failed to remove participant"
          )
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

  // =========================================================
  // MUTE ONE PARTICIPANT
  // =========================================================

  const muteParticipant = async (
    participant: any,
    participantName: string
  ) => {
    try {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const meetingId =
        window.location.pathname.split("/").pop();

      if (!meetingId) {
        alert("Meeting ID not found.");
        return;
      }

      const microphonePublication =
        participant.getTrackPublication(
          "microphone"
        );

      if (!microphonePublication) {
        alert(
          `${participantName} does not have a microphone track.`
        );
        return;
      }

      const trackSid =
        microphonePublication.trackSid;

      if (!trackSid) {
        alert(
          `Could not find ${participantName}'s microphone track.`
        );
        return;
      }

      setMuting(participant.identity);
      setOpenMenu(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}/mute-participant`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
            participant_identity:
              participant.identity,

            track_sid: trackSid,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Failed to mute participant"
          )
        );
      }

      console.log(
        "Participant muted:",
        data
      );

    } catch (error) {
      console.error(
        "Mute participant error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to mute participant"
      );

    } finally {
      setMuting(null);
    }
  };

  // =========================================================
  // MUTE ALL PARTICIPANTS
  // =========================================================

  const muteAllParticipants = async () => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    const meetingId =
      window.location.pathname.split("/").pop();

    if (!meetingId) {
      alert("Meeting ID not found.");
      return;
    }

    const remoteParticipants =
      participants.filter(
        (participant) =>
          participant.identity !==
          localParticipant.identity
      );

    if (remoteParticipants.length === 0) {
      alert("There are no other participants.");
      return;
    }

    const confirmed = window.confirm(
      "Mute all participants?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMutingAll(true);

      let successCount = 0;
      let failedCount = 0;

      for (const participant of remoteParticipants) {
        const microphonePublication = participant.getTrackPublication(Track.Source.Microphone);

        if (!microphonePublication) {
          continue;
        }

        const trackSid =
          microphonePublication.trackSid;

        if (!trackSid) {
          continue;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}/mute-participant`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body: new URLSearchParams({
              participant_identity:
                participant.identity,

              track_sid:
                trackSid,
            }),
          }
        );

        if (response.ok) {
          successCount++;
        } else {
          failedCount++;

          const data =
            await response.json();

          console.error(
            `Failed to mute ${participant.identity}:`,
            data
          );
        }
      }

      console.log(
        `Mute All completed. Success: ${successCount}, Failed: ${failedCount}`
      );

    } catch (error) {
      console.error(
        "Mute all error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to mute all participants"
      );

    } finally {
      setMutingAll(false);
    }
  };

  const stopParticipantVideo = async (
  participant: any,
  participantName: string
) => {
  const confirmed = window.confirm(
    `Stop ${participantName}'s video?`
  );

  if (!confirmed) return;

  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("You are not logged in.");
      return;
    }

    const videoPublication =
      participant.getTrackPublication(
        Track.Source.Camera
      );

    if (!videoPublication) {
      alert(
        `${participantName} does not have a camera track.`
      );
      return;
    }

    const trackSid =
      videoPublication.trackSid;

    if (!trackSid) {
      alert(
        `Could not find ${participantName}'s camera track.`
      );
      return;
    }

    const meetingId =
      window.location.pathname.split("/").pop();

    if (!meetingId) {
      alert("Meeting ID not found.");
      return;
    }

    setStoppingVideo(participant.identity);
    setOpenMenu(null);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}/stop-video`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          participant_identity:
            participant.identity,
          track_sid: trackSid,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          "Failed to stop participant video"
      );
    }

    console.log(
      "Participant video stopped:",
      data
    );

  } catch (error) {
    console.error(
      "Stop participant video error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to stop participant video"
    );

  } finally {
    setStoppingVideo(null);
  }
};

  // =========================================================
  // UI
  // =========================================================

  return (
    <aside className="participant-panel">

      {/* HEADER */}

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
          type="button"
          className="participant-close-button"
          onClick={onClose}
          aria-label="Close participants"
        >
          <X size={20} />
        </button>

      </div>


      {/* INVITE */}

      <div className="participant-invite-section">

        <button
          type="button"
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


      {/* PARTICIPANT LIST */}

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

              {/* AVATAR */}

              <div className="participant-avatar">
                {getInitials(name)}
              </div>


              {/* NAME */}

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


              {/* MEDIA STATUS */}

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


                {/* HOST MENU */}

                {isHost && !isLocal && (

                  <div className="participant-menu-wrapper">

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


                    {/* ACTION MENU */}

                    {openMenu ===
                      participant.identity && (

                      <div className="participant-action-menu">

                    <button
                        type="button"
                        disabled={
                        muting === participant.identity
                        }
                        onClick={() =>
                        muteParticipant(
                            participant,
                            name
                        )
                        }
                    >
                        {muting === participant.identity
                        ? "Muting..."
                        : "Mute Participant"}
                    </button>

                    <button
                        type="button"
                        disabled={
                        stoppingVideo === participant.identity
                        }
                        onClick={() =>
                        stopParticipantVideo(
                            participant,
                            name
                        )
                        }
                    >
                        {stoppingVideo === participant.identity
                        ? "Stopping Video..."
                        : "Stop Video"}
                    </button>

                    <button
                        type="button"
                        className="participant-remove-action"
                        disabled={
                        removing === participant.identity
                        }
                        onClick={() =>
                        removeParticipant(
                            participant.identity,
                            name
                        )
                        }
                    >
                        {removing === participant.identity
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


      {/* HOST CONTROLS */}

      {isHost && (

        <div className="participant-host-controls">

          <button
            type="button"
            className="mute-all-button"
            onClick={muteAllParticipants}
            disabled={mutingAll}
          >
            <MicOff size={17} />

            {mutingAll
              ? "Muting..."
              : "Mute All"}
          </button>

        </div>

      )}

    </aside>
  );
}