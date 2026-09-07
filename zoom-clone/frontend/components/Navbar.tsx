"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
}

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [showProfile, setShowProfile] =
    useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    router.push("/login");
  };

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

      {/* LEFT */}
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
            <ChevronLeft size={21} />
          </button>

          <button
            type="button"
            aria-label="Forward"
            onClick={() => router.forward()}
          >
            <ChevronRight size={21} />
          </button>

          <button
            type="button"
            aria-label="History"
          >
            <Clock3 size={19} />
          </button>

        </div>

      </div>

      {/* CENTER SEARCH */}
      <div className="zoom-navbar-search">

        <div className="zoom-search-box">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search"
          />

          <span className="search-shortcut">
            Ctrl+K
          </span>

        </div>

      </div>

      {/* RIGHT */}
      <div className="zoom-navbar-right">

        <button
          type="button"
          className="upgrade-button"
        >
          Upgrade
        </button>

        <div className="navbar-profile-wrapper">

          <button
            type="button"
            className="zoom-navbar-profile"
            onClick={() =>
              setShowProfile(!showProfile)
            }
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