"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Home,
  Video,
  MessageSquare,
  MoreHorizontal,
  Settings,
  CalendarDays,
  Clock3,
  Users,
  FileText,
} from "lucide-react";

import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [showMore, setShowMore] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar zoom-sidebar">

      {/* MAIN NAVIGATION */}
      <nav className="zoom-sidebar-nav">

        <Link
          href="/"
          className={`zoom-sidebar-item ${
            isActive("/") ? "active" : ""
          }`}
        >
          <Home size={20} strokeWidth={1.8} />
          <span>Home</span>
        </Link>

        <Link
          href="/meetings"
          className={`zoom-sidebar-item ${
            isActive("/meetings") ? "active" : ""
          }`}
        >
          <Video size={20} strokeWidth={1.8} />
          <span>Meetings</span>
        </Link>

        <Link
          href="/chat"
          className={`zoom-sidebar-item ${
            isActive("/chat") ? "active" : ""
          }`}
        >
          <MessageSquare size={20} strokeWidth={1.8} />
          <span>Chat</span>
        </Link>

        <div className="zoom-more-wrapper">

          <button
            type="button"
            className={`zoom-sidebar-item zoom-more-button ${
              showMore ? "active" : ""
            }`}
            onClick={() => setShowMore(!showMore)}
          >
            <MoreHorizontal
              size={20}
              strokeWidth={2}
            />

            <span>More</span>
          </button>

          {showMore && (
            <div className="zoom-more-menu">

              <button
                type="button"
                onClick={() => router.push("/contacts")}
              >
                <Users size={17} />
                Contacts
              </button>

              <button
                type="button"
                onClick={() => router.push("/history")}
              >
                <Clock3 size={17} />
                History
              </button>

              <button
                type="button"
                onClick={() => router.push("/files")}
              >
                <FileText size={17} />
                Files
              </button>

            </div>
          )}

        </div>

      </nav>

      {/* SETTINGS AT BOTTOM */}
      <div className="zoom-sidebar-bottom">

        <Link
          href="/settings"
          className={`zoom-sidebar-item ${
            isActive("/settings") ? "active" : ""
          }`}
        >
          <Settings
            size={20}
            strokeWidth={1.8}
          />

          <span>Settings</span>
        </Link>

      </div>

    </aside>
  );
}