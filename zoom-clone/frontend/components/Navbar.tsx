"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  HelpCircle,
  Search,
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

  const [user, setUser] = useState<UserProfile | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // ---------------------------------------------------------
  // Load user profile
  // ---------------------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data: UserProfile = await response.json();

        setUser(data);

        // Keep localStorage user information updated
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            profile_picture: data.profile_picture,
          })
        );
      } catch (error) {
        console.error("Failed to load profile:", error);

        // Fallback to localStorage
        const storedUser = localStorage.getItem("user");

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

  // ---------------------------------------------------------
  // Logout
  // ---------------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  // ---------------------------------------------------------
  // Profile image component
  // ---------------------------------------------------------

  const ProfileAvatar = ({
    large = false,
  }: {
    large?: boolean;
  }) => {
    return (
      <div className={`navbar-avatar ${large ? "large" : ""}`}>
        {user?.profile_picture ? (
          <img
            src={`${API_URL}${user.profile_picture}`}
            alt="Profile"
            className="navbar-avatar-image"
          />
        ) : (
          user?.name?.charAt(0).toUpperCase() || "U"
        )}
      </div>
    );
  };

  return (
    <header className="navbar">

      {/* -------------------------------------------------- */}
      {/* LEFT */}
      {/* -------------------------------------------------- */}

      <div className="navbar-left">
        <div className="zoom-logo">
          <span className="zoom-logo-icon">Z</span>
          <span className="zoom-logo-text">Zoom</span>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* CENTER */}
      {/* -------------------------------------------------- */}

      <div className="navbar-center">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search"
          />
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* RIGHT */}
      {/* -------------------------------------------------- */}

      <div className="navbar-right">

        <button className="icon-button">
          <HelpCircle size={20} />
        </button>

        <button className="icon-button">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        {/* Profile */}

        <div className="navbar-profile-wrapper">

          <button
            className="navbar-profile-button"
            onClick={() => setShowProfile(!showProfile)}
          >

            {/* Actual profile picture */}
            <ProfileAvatar />

            <div className="navbar-user-info">
              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.email || ""}
              </span>
            </div>

            <ChevronDown size={16} />

          </button>

          {/* ------------------------------------------------ */}
          {/* PROFILE DROPDOWN */}
          {/* ------------------------------------------------ */}

          {showProfile && (
            <div className="navbar-profile-menu">

              <div className="profile-menu-header">

                {/* Large profile picture */}
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

              {/* Profile */}

              <button
                onClick={() => {
                  setShowProfile(false);
                  router.push("/profile");
                }}
              >
                <User size={17} />
                Profile
              </button>

              {/* Settings */}

              <button
                onClick={() => {
                  setShowProfile(false);
                  router.push("/settings");
                }}
              >
                <Settings size={17} />
                Settings
              </button>

              <div className="profile-menu-divider" />

              {/* Logout */}

              <button
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