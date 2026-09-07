"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MeetingActions from "@/components/MeetingActions";
import UpcomingMeetings from "@/components/UpcomingMeetings";
import PreviousMeetings from "@/components/PreviousMeetings";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="zoom-app">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          <div className="page-heading">
            <div>
              <p className="greeting">Good morning</p>

              <h1>Welcome back, Nishant</h1>
            </div>

            <div className="current-date">
              Monday, September 7, 2026
            </div>
          </div>

          <MeetingActions />

          <UpcomingMeetings />
          
          <PreviousMeetings />

        </main>
      </div>
    </div>
  );
}