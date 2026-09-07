"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

import {
  CalendarDays,
  Clock3,
  Copy,
  Check,
  Pencil,
  Video,
  RefreshCw,
} from "lucide-react";

interface Meeting {
  id: number;
  meeting_id: string;
  host_id: number;
  title: string;
  scheduled_at: string | null;
  created_at: string | null;
  started_at: string | null;
  ended_at: string | null;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function MeetingsPage() {
  const router = useRouter();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] =
    useState<Meeting | null>(null);

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [currentTime, setCurrentTime] =
    useState("");

  const [currentDate, setCurrentDate] =
    useState("");

  /* =====================================================
     SYSTEM DATE + TIME
     ===================================================== */

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      );

      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    updateDateTime();

    const interval = setInterval(
      updateDateTime,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  /* =====================================================
     AUTH + GET UPCOMING MEETINGS
     ===================================================== */

  const loadMeetings = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/meetings/upcoming/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load meetings"
        );
      }

      const data: Meeting[] =
        await response.json();

      setMeetings(data);

      /*
       * Automatically select the first upcoming
       * meeting.
       */
      if (data.length > 0) {
        setSelectedMeeting(data[0]);
      } else {
        setSelectedMeeting(null);
      }
    } catch (error) {
      console.error(
        "Failed to load meetings:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  /* =====================================================
     FORMAT DATE
     ===================================================== */

  const formatMeetingDate = (
    dateString: string | null
  ) => {
    if (!dateString) {
      return "No date";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =====================================================
     FORMAT TIME
     ===================================================== */

  const formatMeetingTime = (
    dateString: string | null
  ) => {
    if (!dateString) {
      return "No time";
    }

    return new Date(
      dateString
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* =====================================================
     COPY INVITATION
     ===================================================== */

  const copyInvitation = async (
    meeting: Meeting
  ) => {
    const meetingLink =
      `${window.location.origin}/meeting/${meeting.meeting_id}`;

    const invitation =
      `You are invited to a meeting.

Meeting: ${meeting.title}
Meeting ID: ${meeting.meeting_id}

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
        "Failed to copy invitation:",
        error
      );
    }
  };

  /* =====================================================
     START MEETING
     ===================================================== */

  const startMeeting = (
    meeting: Meeting
  ) => {
    router.push(
      `/meeting/${meeting.meeting_id}`
    );
  };

  /* =====================================================
     EDIT
     ===================================================== */

  const editMeeting = (
    meeting: Meeting
  ) => {
    /*
     * Your backend currently does not expose an
     * update-meeting endpoint, so don't pretend
     * editing is implemented yet.
     *
     * We can add the real Edit Meeting functionality
     * after the UI is complete.
     */
    alert(
      `Edit Meeting\n\n${meeting.title}\nMeeting ID: ${meeting.meeting_id}\n\nEdit functionality can be connected to the backend next.`
    );
  };

  /* =====================================================
     * DISPLAY MEETING
     * ===================================================== */

  const displayMeeting =
    selectedMeeting;

  return (
    <div className="zoom-app zoom-meetings-page">

      <Navbar />

      <div className="app-body">

        <Sidebar />

        <main className="meetings-main">

          {/* =================================================
              LEFT MEETING LIST
          ================================================= */}

          <aside className="meetings-list-panel">

            <div className="meetings-list-header">

              <button
                type="button"
                className="meetings-refresh-button"
                onClick={loadMeetings}
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>

              <h2>
                Upcoming
              </h2>

            </div>

            {/* MEETING LIST */}

            <div className="meetings-list-content">

              {loading ? (
                <div className="meetings-list-empty">
                  Loading...
                </div>
              ) : meetings.length === 0 ? (
                <div className="meetings-list-empty">
                  No upcoming meetings
                </div>
              ) : (
                meetings.map((meeting) => (

                  <button
                    key={meeting.id}
                    type="button"
                    className={`meeting-list-card ${
                      selectedMeeting?.id ===
                      meeting.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedMeeting(
                        meeting
                      )
                    }
                  >

                    <div className="meeting-list-card-id">
                      {meeting.meeting_id}
                    </div>

                    <div className="meeting-list-card-title">
                      {meeting.title}
                    </div>

                  </button>

                ))
              )}

            </div>

            {/* CURRENT DATE / TIME */}

            <div className="meetings-system-info">

              <div>
                <Clock3 size={14} />

                <span>
                  {currentTime}
                </span>
              </div>

              <span>
                {currentDate}
              </span>

            </div>

          </aside>


          {/* =================================================
              RIGHT MEETING DETAILS
          ================================================= */}

          <section className="meeting-details-panel">

            {displayMeeting ? (

              <>

                <div className="meeting-details-content">

                  <h1>
                    {displayMeeting.title}
                  </h1>

                  <div className="meeting-details-id">
                    {displayMeeting.meeting_id}
                  </div>


                  {/* ACTIONS */}

                  <div className="meeting-details-actions">

                    <button
                      type="button"
                      className="meeting-start-button"
                      onClick={() =>
                        startMeeting(
                          displayMeeting
                        )
                      }
                    >
                      Start
                    </button>


                    <button
                      type="button"
                      className="meeting-copy-button"
                      onClick={() =>
                        copyInvitation(
                          displayMeeting
                        )
                      }
                    >

                      {copied ? (
                        <>
                          <Check size={15} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={15} />
                          Copy Invitation
                        </>
                      )}

                    </button>


                    <button
                      type="button"
                      className="meeting-edit-button"
                      onClick={() =>
                        editMeeting(
                          displayMeeting
                        )
                      }
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                  </div>


                  {/* SCHEDULE INFORMATION */}

                  {displayMeeting.scheduled_at && (
                    <div className="meeting-schedule-info">

                      <div>
                        <CalendarDays size={16} />

                        <span>
                          {formatMeetingDate(
                            displayMeeting.scheduled_at
                          )}
                        </span>
                      </div>

                      <div>
                        <Clock3 size={16} />

                        <span>
                          {formatMeetingTime(
                            displayMeeting.scheduled_at
                          )}
                        </span>
                      </div>

                    </div>
                  )}


                  {/* INVITATION */}

                  <button
                    type="button"
                    className="show-invitation-button"
                    onClick={() =>
                      copyInvitation(
                        displayMeeting
                      )
                    }
                  >
                    Show Meeting Invitation
                  </button>

                </div>

              </>

            ) : (

              <div className="no-selected-meeting">

                <div className="no-selected-icon">
                  <Video size={30} />
                </div>

                <h2>
                  No upcoming meetings
                </h2>

                <p>
                  Schedule a meeting to see it here.
                </p>

              </div>

            )}

          </section>

        </main>

      </div>

    </div>
  );
}