"use client";

import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <main className="dashboard-page">

      <h1>Chat</h1>

      <p className="page-description">
        Your conversations will appear here.
      </p>

      <div className="chat-empty">

        <div className="chat-empty-icon">
          <MessageSquare size={42} />
        </div>

        <h2>No conversations yet</h2>
        
        <p>
          Start a conversation with your contacts.
        </p>

      </div>

    </main>
  );
}