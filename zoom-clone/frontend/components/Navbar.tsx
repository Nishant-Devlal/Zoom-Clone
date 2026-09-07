"use client";

import {
  Bell,
  ChevronDown,
  HelpCircle,
  Search,
} from "lucide-react";

export default function Navbar() {
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

          <input
            type="text"
            placeholder="Search"
          />
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

        <button className="profile-button">

          <div className="profile-avatar">
            N
          </div>

          <div className="profile-info">
            <span className="profile-name">
              Nishant
            </span>

            <span className="profile-email">
              nishant@example.com
            </span>
          </div>

          <ChevronDown size={16} />

        </button>

      </div>
    </header>
  );
}