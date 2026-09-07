"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  CalendarDays,
  Users,
  Clock3,
  FileText,
} from "lucide-react";

const workspaceItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Meetings",
    href: "/meetings",
    icon: CalendarDays,
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: Users,
  },
];

const personalItems = [
  {
    name: "History",
    href: "/history",
    icon: Clock3,
  },
  {
    name: "Files",
    href: "/files",
    icon: FileText,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderItem = (item: {
    name: string;
    href: string;
    icon: React.ElementType;
  }) => {
    const Icon = item.icon;

    const isActive =
      item.href === "/"
        ? pathname === "/"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`sidebar-item ${isActive ? "active" : ""}`}
      >
        <Icon size={28} strokeWidth={1.8} />

        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="sidebar">

      {/* WORKSPACE */}
      <div className="sidebar-section">
        <h3>WORKSPACE</h3>

        <nav>
          {workspaceItems.map(renderItem)}
        </nav>
      </div>

      {/* PERSONAL */}
      <div className="sidebar-section personal-section">
        <h3>PERSONAL</h3>

        <nav>
          {personalItems.map(renderItem)}
        </nav>
      </div>

    </aside>
  );
}