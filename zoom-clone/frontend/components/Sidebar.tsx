"use client";

import {
  CalendarDays,
  ChevronLeft,
  Clock3,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-section">

        <p className="sidebar-title">
          Workspace
        </p>

        <button className="sidebar-item active">
          <Home size={20} />
          <span>Home</span>
        </button>

        <button className="sidebar-item">
          <MessageSquare size={20} />
          <span>Chat</span>
        </button>

        <button className="sidebar-item">
          <CalendarDays size={20} />
          <span>Meetings</span>
        </button>

        <button className="sidebar-item">
          <Users size={20} />
          <span>Contacts</span>
        </button>

      </div>

      <div className="sidebar-section">

        <p className="sidebar-title">
          Personal
        </p>

        <button className="sidebar-item">
          <Clock3 size={20} />
          <span>History</span>
        </button>

        <button className="sidebar-item">
          <FileText size={20} />
          <span>Files</span>
        </button>

      </div>

      <div className="sidebar-bottom">

        <button className="sidebar-item">
          <Settings size={20} />
          <span>Settings</span>
        </button>

        <button className="collapse-button">
          <ChevronLeft size={18} />
        </button>

      </div>

    </aside>
  );
}