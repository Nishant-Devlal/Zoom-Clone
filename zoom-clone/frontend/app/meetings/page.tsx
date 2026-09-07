"use client";

import UpcomingMeetings from "@/components/UpcomingMeetings";
import PreviousMeetings from "@/components/PreviousMeetings";

export default function MeetingsPage() {
  return (
    <main className="dashboard-page">

      <h1>Meetings</h1>

      <section className="dashboard-section">
        <h2>Upcoming Meetings</h2>
        <UpcomingMeetings />
      </section>

      <section className="dashboard-section">
        <h2>Previous Meetings</h2>
        <PreviousMeetings />
      </section>

    </main>
  );
}