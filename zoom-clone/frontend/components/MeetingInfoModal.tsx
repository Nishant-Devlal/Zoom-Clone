"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  Lock,
  Unlock,
  ShieldCheck,
  Calendar,
  Clock,
  User,
} from "lucide-react";

interface MeetingInfoModalProps {
  meetingTitle: string;
  meetingId: string;
  meetingLocked: boolean;
  startedAt?: string | null;
  endedAt?: string | null;
  isHost: boolean;
  onClose: () => void;
}

export default function MeetingInfoModal({
  meetingTitle,
  meetingId,
  meetingLocked,
  startedAt,
  endedAt,
  isHost,
  onClose,
}: MeetingInfoModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const meetingLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/meeting/${meetingId}`
      : `/meeting/${meetingId}`;

  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);

      setCopiedId(true);

      setTimeout(() => {
        setCopiedId(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy meeting ID:",
        error
      );
    }
  };

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(
        meetingLink
      );

      setCopiedLink(true);

      setTimeout(() => {
        setCopiedLink(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy meeting link:",
        error
      );
    }
  };

  const formatDateTime = (
    value?: string | null
  ) => {
    if (!value) {
      return "Not available";
    }

    try {
      return new Date(value).toLocaleString(
        undefined,
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return "Not available";
    }
  };

  return (
    <div
      className="meeting-info-overlay"
      onClick={onClose}
    >
      <div
        className="meeting-info-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="meeting-info-header">
          <div>
            <h2>Meeting Information</h2>
            <p>
              Details about this meeting
            </p>
          </div>

          <button
            type="button"
            className="meeting-info-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="meeting-info-content">

          {/* Meeting */}
          <div className="meeting-info-section">
            <div className="meeting-info-label">
              <Calendar size={16} />
              Meeting
            </div>

            <div className="meeting-info-value meeting-info-title">
              {meetingTitle}
            </div>
          </div>

          {/* Meeting ID */}
          <div className="meeting-info-section">
            <div className="meeting-info-label">
              Meeting ID
            </div>

            <div className="meeting-info-copy-row">
              <span className="meeting-info-main-value">
                {meetingId}
              </span>

              <button
                type="button"
                className="meeting-info-copy-button"
                onClick={copyMeetingId}
              >
                {copiedId ? (
                  <>
                    <Check size={15} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="meeting-info-section">
            <div className="meeting-info-label">
              <ShieldCheck size={16} />
              Security
            </div>

            <div className="meeting-info-status">
              {meetingLocked ? (
                <>
                  <Lock size={15} />
                  Meeting Locked
                </>
              ) : (
                <>
                  <Unlock size={15} />
                  Meeting Unlocked
                </>
              )}
            </div>
          </div>

          {/* Host / Role */}
          <div className="meeting-info-section">
            <div className="meeting-info-label">
              <User size={16} />
              Your Role
            </div>

            <div className="meeting-info-value">
              {isHost ? "Host" : "Participant"}
            </div>
          </div>

          {/* Started */}
          <div className="meeting-info-section">
            <div className="meeting-info-label">
              <Clock size={16} />
              Started
            </div>

            <div className="meeting-info-value">
              {formatDateTime(startedAt)}
            </div>
          </div>

          {/* Ended */}
          {endedAt && (
            <div className="meeting-info-section">
              <div className="meeting-info-label">
                <Clock size={16} />
                Ended
              </div>

              <div className="meeting-info-value">
                {formatDateTime(endedAt)}
              </div>
            </div>
          )}

          {/* Meeting Link */}
          <div className="meeting-info-section">
            <div className="meeting-info-label">
              Meeting Link
            </div>

            <div className="meeting-info-link-box">
              <span title={meetingLink}>
                {meetingLink}
              </span>

              <button
                type="button"
                className="meeting-info-copy-button"
                onClick={copyMeetingLink}
              >
                {copiedLink ? (
                  <>
                    <Check size={15} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="meeting-info-footer">
          <button
            type="button"
            className="meeting-info-done-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}