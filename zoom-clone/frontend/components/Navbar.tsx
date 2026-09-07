"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  User,
  LogOut,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Video,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
}

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

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [showProfile, setShowProfile] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const [history, setHistory] =
    useState<Meeting[]>([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  /* =====================================================
     LOAD PROFILE
     ===================================================== */

  useEffect(() => {
    const loadProfile = async () => {
      const token =
        localStorage.getItem("access_token");

      if (!token) return;

      try {
        const response = await fetch(
          `${API_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data: UserProfile =
          await response.json();

        setUser(data);

        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem("user");
          }
        }
      }
    };

    loadProfile();
  }, []);

  /* =====================================================
     LOAD MEETING HISTORY
     ===================================================== */

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const token =
        localStorage.getItem("access_token");

      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/meetings/previous/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load meeting history"
        );
      }

      const data: Meeting[] =
        await response.json();

      setHistory(data.slice(0, 5));
    } catch (error) {
      console.error(
        "History loading error:",
        error
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  /* =====================================================
     HISTORY BUTTON
     ===================================================== */

  const toggleHistory = async () => {
    setShowProfile(false);

    const willOpen = !showHistory;

    setShowHistory(willOpen);

    if (willOpen) {
      await loadHistory();
    }
  };

  /* =====================================================
     LOGOUT
     ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  /* =====================================================
     FORMAT HISTORY DATE
     ===================================================== */

  const formatHistoryDate = (
    dateString: string | null
  ) => {
    if (!dateString) {
      return "Unknown date";
    }

    const date = new Date(dateString);

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* =====================================================
     PROFILE AVATAR
     ===================================================== */

  const ProfileAvatar = ({
    large = false,
  }: {
    large?: boolean;
  }) => {
    return (
      <div
        className={`navbar-avatar ${
          large ? "large" : ""
        }`}
      >
        {user?.profile_picture ? (
          <img
            src={`${API_URL}${user.profile_picture}`}
            alt="Profile"
            className="navbar-avatar-image"
          />
        ) : (
          user?.name
            ?.charAt(0)
            .toUpperCase() || "U"
        )}
      </div>
    );
  };

  return (
    <header className="navbar zoom-navbar">

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="zoom-navbar-left">

        <div className="zoom-workplace-logo">
          <span>zoom</span>
          <strong>Workplace</strong>
        </div>

        <div className="zoom-navigation-controls">

          <button
            type="button"
            aria-label="Back"
            onClick={() => router.back()}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Forward"
            onClick={() => router.forward()}
          >
            <ChevronRight size={18} />
          </button>

          {/* ==========================================
              HISTORY BUTTON
          ========================================== */}

          <div className="navbar-history-wrapper">

            <button
              type="button"
              className={`navbar-history-button ${
                showHistory ? "active" : ""
              }`}
              aria-label="Meeting history"
              title="Meeting history"
              onClick={toggleHistory}
            >
              <Clock3 size={18} />
            </button>

            {showHistory && (
              <div className="navbar-history-popup">

                <div className="history-popup-header">

                  <div>
                    <strong>
                      Recent meetings
                    </strong>

                    <span>
                      Your previous meetings
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowHistory(false);
                      router.push("/history");
                    }}
                  >
                    View all
                  </button>

                </div>

                <div className="history-popup-list">

                  {historyLoading ? (

                    <div className="history-popup-empty">
                      Loading history...
                    </div>

                  ) : history.length === 0 ? (

                    <div className="history-popup-empty">

                      <Clock3 size={25} />

                      <span>
                        No previous meetings
                      </span>

                    </div>

                  ) : (

                    history.map((meeting) => (

                      <button
                        type="button"
                        key={meeting.id}
                        className="history-popup-item"
                        onClick={() => {
                          setShowHistory(false);

                          router.push(
                            `/meeting/${meeting.meeting_id}`
                          );
                        }}
                      >

                        <div className="history-popup-icon">
                          <Video size={16} />
                        </div>

                        <div className="history-popup-info">

                          <strong>
                            {meeting.title}
                          </strong>

                          <span>
                            {formatHistoryDate(
                              meeting.ended_at ||
                              meeting.started_at ||
                              meeting.created_at
                            )}
                          </span>

                          <small>
                            ID: {meeting.meeting_id}
                          </small>

                        </div>

                      </button>

                    ))

                  )}

                </div>

              </div>
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="zoom-navbar-search">

        <div className="zoom-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search"
          />

          <span className="search-shortcut">
            Ctrl+K
          </span>

        </div>

      </div>


      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="zoom-navbar-right">

        <div className="navbar-profile-wrapper">

          <button
            type="button"
            className="zoom-navbar-profile"
            onClick={() => {
              setShowHistory(false);
              setShowProfile(
                !showProfile
              );
            }}
          >
            <ProfileAvatar />
          </button>

          {showProfile && (
            <div className="navbar-profile-menu">

              <div className="profile-menu-header">

                <ProfileAvatar large />

                <div>
                  <strong>
                    {user?.name || "User"}
                  </strong>

                  <span>
                    {user?.email || ""}
                  </span>
                </div>

              </div>

              <div className="profile-menu-divider" />

              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
                  router.push("/profile");
                }}
              >
                <User size={17} />
                Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
                  router.push("/settings");
                }}
              >
                <Settings size={17} />
                Settings
              </button>

              <div className="profile-menu-divider" />

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Sign out
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}