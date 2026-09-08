"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MeetingActions from "@/components/MeetingActions";
import UpcomingMeetings from "@/components/UpcomingMeetings";
import PreviousMeetings from "@/components/PreviousMeetings";

export default function Home() {

  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const updateDateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      );

      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };

    updateDateTime();

    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="zoom-app zoom-home-page">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content zoom-dashboard-content">

          {/* TIME */}
          <section className="zoom-welcome">
            <h1>{currentTime || "12:00 PM"}</h1>

            <p>
              {currentDate || "Monday, September 7"}
            </p>
          </section>

          {/* NEW MEETING / JOIN / SCHEDULE */}
          <section className="zoom-dashboard-actions">
            <MeetingActions />
          </section>

          {/* CALENDAR */}
          <section className="zoom-calendar-card">

            {/* Date heading */}
            <div className="calendar-heading">
              <strong>
                Today,{" "}
                {new Date().toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })}
              </strong>

              <button
                type="button"
                className="calendar-external-button"
                aria-label="Open calendar"
              >
                ↗
              </button>
            </div>

            {/* Calendar toolbar */}
            <div className="calendar-toolbar">

              <button
                type="button"
                className="today-button"
              >
                <span className="calendar-small-icon">
                  □
                </span>
                Today
              </button>

              <div className="calendar-navigation">
                <button type="button" aria-label="Previous day">
                  ‹
                </button>

                <button type="button" aria-label="Next day">
                  ›
                </button>
              </div>

              <button
                type="button"
                className="calendar-more-button"
                aria-label="More calendar options"
              >
                •••
              </button>
            </div>

            {/* Existing upcoming meetings */}
            <div className="zoom-calendar-meetings">
              <UpcomingMeetings />
            </div>

          </section>

          <div className="zoom-home-history">
            <PreviousMeetings />
          </div>

        </main>
      </div>
    </div>
  );
}