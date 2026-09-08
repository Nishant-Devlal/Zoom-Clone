"use client";

import PreviousMeetings from "@/components/PreviousMeetings";

export default function HistoryPage() {
  return (
    <main className="dashboard-page">

      <h1>Meeting History</h1>
      <p className="page-description">
        View your previous meetings and meeting details.
      </p>
      <PreviousMeetings />
      
    </main>
  );
}