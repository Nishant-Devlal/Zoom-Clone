"use client";

import {
  CalendarDays,
  Clock,
  MoreHorizontal,
} from "lucide-react";

export default function UpcomingMeetings() {
  return (
    <section className="upcoming-section">

      <div className="section-header">

        <div>
          <h2>Upcoming Meetings</h2>
          <p>Your scheduled meetings</p>
        </div>

        <button className="view-all">
          View all
        </button>

      </div>

      <div className="meeting-list">

        <div className="meeting-row">

          <div className="meeting-date">
            <span>SEP</span>
            <strong>07</strong>
          </div>

          <div className="meeting-details">

            <h3>
              Computer Science Project
            </h3>

            <div className="meeting-meta">

              <span>
                <Clock size={15} />
                10:30 AM
              </span>

              <span>
                <CalendarDays size={15} />
                60 min
              </span>

            </div>

          </div>

          <button className="join-button">
            Start
          </button>

          <button className="more-button">
            <MoreHorizontal size={20} />
          </button>

        </div>

        <div className="meeting-row">

          <div className="meeting-date">
            <span>SEP</span>
            <strong>08</strong>
          </div>

          <div className="meeting-details">

            <h3>
              Team Discussion
            </h3>

            <div className="meeting-meta">

              <span>
                <Clock size={15} />
                2:00 PM
              </span>

              <span>
                <CalendarDays size={15} />
                30 min
              </span>

            </div>

          </div>

          <button className="join-button">
            Start
          </button>

          <button className="more-button">
            <MoreHorizontal size={20} />
          </button>

        </div>

      </div>

    </section>
  );
}