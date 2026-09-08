"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

interface UserProfile {
  id: number;
  name: string;
  email: string;
  profile_picture: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Get authentication token
  // ---------------------------------------------------------

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("access_token");
  };

  // ---------------------------------------------------------
  // Load profile
  // ---------------------------------------------------------

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            router.push("/login");
            return;
          }

          throw new Error("Failed to load profile");
        }

        const data: UserProfile = await response.json();

        setProfile(data);
        setName(data.name);
      } catch (err) {
        console.error(err);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ---------------------------------------------------------
  // Save profile name
  // ---------------------------------------------------------

  const handleSaveProfile = async () => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update profile");
      }

      setProfile(data);

      // Keep the locally stored user information updated
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...user,
              name: data.name,
            })
          );
        } catch {
          console.log("Could not update stored user");
        }
      }

      setMessage("Profile updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // Open file selector
  // ---------------------------------------------------------

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  // ---------------------------------------------------------
  // Upload profile picture
  // ---------------------------------------------------------

  const handlePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setError("");

    // Client-side validation
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, GIF and WEBP images are allowed.");

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile picture must be smaller than 2 MB.");

      event.target.value = "";
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch(`${API_URL}/api/profile/picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to upload profile picture"
        );
      }

      setProfile((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          profile_picture: data.profile_picture,
        };
      });

      setMessage("Profile picture updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload profile picture.");
    } finally {
      setUploading(false);

      // Allow selecting the same file again
      event.target.value = "";
    }
  };

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <div className="profile-page">

      {/* Header */}

      <div className="profile-header">
        <button
          className="profile-back-button"
          onClick={() => router.push("/")}
        >
          ←
        </button>

        <div>
          <h1>Profile</h1>
          <p>Manage your personal information</p>
        </div>
      </div>

      {/* Main card */}

      <div className="profile-card">

        {/* Profile picture */}

        <div className="profile-picture-section">

          <div className="profile-avatar-large">

            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
              />
            ) : (
              <span>
                {profile?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}

          </div>

          <div className="profile-picture-info">

            <h2>{profile?.name}</h2>

            <p>Profile picture</p>

            <button
              className="change-photo-button"
              onClick={handleChoosePhoto}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePictureUpload}
              style={{ display: "none" }}
            />

            <span className="photo-help">
              JPG, PNG, GIF or WEBP · Maximum 2 MB
            </span>

          </div>

        </div>

        <div className="profile-divider" />

        {/* Personal information */}

        <div className="profile-section">

          <h2>Personal Information</h2>

          <div className="profile-form">

            <div className="profile-field">
              <label>Name</label>

              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                  setMessage("");
                }}
                maxLength={100}
                placeholder="Enter your name"
              />
            </div>

            <div className="profile-field">
              <label>Email</label>

              <input
                type="email"
                value={profile?.email || ""}
                disabled
              />

              <span className="field-help">
                Your email address cannot be changed here.
              </span>
            </div>

            <div className="profile-field">
              <label>User ID</label>

              <input
                type="text"
                value={profile?.id || ""}
                disabled
              />
            </div>

          </div>

        </div>

        {/* Messages */}

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        {message && (
          <div className="profile-success">
            {message}
          </div>
        )}

        {/* Actions */}

        <div className="profile-actions">

          <button
            className="profile-cancel-button"
            onClick={() => router.push("/")}
          >
            Cancel
          </button>

          <button
            className="profile-save-button"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  );
}