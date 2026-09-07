"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings } from "lucide-react";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  Search,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);

  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="zoom-logo">
          <span className="zoom-logo-icon">Z</span>
          <span className="zoom-logo-text">Zoom</span>
        </div>
      </div>

      <div className="navbar-center">
        <div className="search-box">
          <Search size={18} />

          <input type="text" placeholder="Search" />
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-button">
          <HelpCircle size={20} />
        </button>

        <button className="icon-button">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="navbar-profile-wrapper">
          <button
            className="navbar-profile-button"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="navbar-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="navbar-user-info">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.email || ""}</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {showProfile && (
            <div className="navbar-profile-menu">
              <div className="profile-menu-header">
                <div className="navbar-avatar large">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                  <strong>{user?.name || "User"}</strong>
                  <span>{user?.email || ""}</span>
                </div>
              </div>

              <div className="profile-menu-divider" />

              <button
                onClick={() => {
                  setShowProfile(false);
                  router.push("/profile");
                }}
              >
                <User size={17} />
                Profile
              </button>

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

              <button className="logout-button" onClick={handleLogout}>
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