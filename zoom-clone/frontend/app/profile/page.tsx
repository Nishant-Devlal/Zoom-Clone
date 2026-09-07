"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";

interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <main className="profile-page">
      <button
        className="back-button"
        onClick={() => router.push("/")}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="profile-card">
        <div className="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <h1>{user.name}</h1>

        <p>{user.email}</p>

        <div className="profile-info">
          <div>
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div>
            <span>User ID</span>
            <strong>{user.id}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}