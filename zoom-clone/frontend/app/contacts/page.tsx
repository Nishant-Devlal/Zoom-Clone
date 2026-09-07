"use client";

import { Search, UserPlus } from "lucide-react";

export default function ContactsPage() {
  return (
    <main className="dashboard-page">

      <div className="page-header">
        <div>
          <h1>Contacts</h1>
          <p className="page-description">
            Manage your contacts and invite people to meetings.
          </p>
        </div>

        <button className="primary-button">
          <UserPlus size={18} />
          Add Contact
        </button>
      </div>

      <div className="search-box">
        <Search size={20} />

        <input
          type="text"
          placeholder="Search contacts..."
        />
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          👥
        </div>

        <h2>No contacts yet</h2>

        <p>
          Add contacts to quickly invite them to meetings.
        </p>
      </div>

    </main>
  );
}