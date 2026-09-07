"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Globe,
  Mic,
  Monitor,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Video,
  Volume2,
} from "lucide-react";

type Theme = "light" | "dark" | "system";

interface Settings {
  theme: Theme;
  autoJoinAudio: boolean;
  autoJoinVideo: boolean;
  meetingNotifications: boolean;
  chatNotifications: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  autoJoinAudio: true,
  autoJoinVideo: true,
  meetingNotifications: true,
  chatNotifications: true,
};

export default function SettingsPage() {
  const router = useRouter();

  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [saved, setSaved] = useState(false);

  // ---------------------------------------------------------
  // Load settings
  // ---------------------------------------------------------

  useEffect(() => {
    const storedSettings = localStorage.getItem("zoom_settings");

    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);

        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
      } catch {
        localStorage.removeItem("zoom_settings");
      }
    }
  }, []);

  // ---------------------------------------------------------
  // Apply theme
  // ---------------------------------------------------------

  useEffect(() => {
    const applyTheme = () => {
      let theme = settings.theme;

      if (theme === "system") {
        theme = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
          ? "dark"
          : "light";
      }

      document.documentElement.setAttribute(
        "data-theme",
        theme
      );
    };

    applyTheme();
  }, [settings.theme]);

  // ---------------------------------------------------------
  // Update setting
  // ---------------------------------------------------------

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  // ---------------------------------------------------------
  // Save settings
  // ---------------------------------------------------------

  const saveSettings = () => {
    localStorage.setItem(
      "zoom_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  // ---------------------------------------------------------
  // Toggle
  // ---------------------------------------------------------

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => {
    return (
      <button
        type="button"
        className={`settings-toggle ${
          checked ? "active" : ""
        }`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span className="settings-toggle-knob" />
      </button>
    );
  };

  return (
    <div className="settings-page">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="settings-header">

        <button
          className="settings-back-button"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1>Settings</h1>
          <p>
            Customize your Zoom experience
          </p>
        </div>

      </div>


      {/* ================================================= */}
      {/* SETTINGS LAYOUT */}
      {/* ================================================= */}

      <div className="settings-layout">

        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <aside className="settings-sidebar">

          <div className="settings-sidebar-title">
            Settings
          </div>

          <button className="settings-nav-item active">
            <SettingsIcon size={18} />
            General
          </button>

          <button
            className="settings-nav-item"
            onClick={() =>
              document
                .getElementById("meeting-settings")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <Video size={18} />
            Meeting
          </button>

          <button
            className="settings-nav-item"
            onClick={() =>
              document
                .getElementById("notification-settings")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <Bell size={18} />
            Notifications
          </button>

        </aside>


        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <main className="settings-content">

          {/* =============================================== */}
          {/* APPEARANCE */}
          {/* =============================================== */}

          <section className="settings-card">

            <div className="settings-card-header">

              <div className="settings-section-icon">
                <Monitor size={20} />
              </div>

              <div>
                <h2>Appearance</h2>
                <p>
                  Choose how the application looks.
                </p>
              </div>

            </div>


            <div className="theme-options">

              {/* Light */}

              <button
                className={`theme-option ${
                  settings.theme === "light"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  updateSetting("theme", "light")
                }
              >

                <div className="theme-preview light-preview">
                  <Sun size={24} />
                </div>

                <div className="theme-option-info">
                  <strong>Light</strong>
                  <span>
                    Use the light appearance
                  </span>
                </div>

                {settings.theme === "light" && (
                  <Check size={18} />
                )}

              </button>


              {/* Dark */}

              <button
                className={`theme-option ${
                  settings.theme === "dark"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  updateSetting("theme", "dark")
                }
              >

                <div className="theme-preview dark-preview">
                  <Moon size={24} />
                </div>

                <div className="theme-option-info">
                  <strong>Dark</strong>
                  <span>
                    Use the dark appearance
                  </span>
                </div>

                {settings.theme === "dark" && (
                  <Check size={18} />
                )}

              </button>


              {/* System */}

              <button
                className={`theme-option ${
                  settings.theme === "system"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  updateSetting("theme", "system")
                }
              >

                <div className="theme-preview system-preview">
                  <Monitor size={24} />
                </div>

                <div className="theme-option-info">
                  <strong>System</strong>
                  <span>
                    Follow your device settings
                  </span>
                </div>

                {settings.theme === "system" && (
                  <Check size={18} />
                )}

              </button>

            </div>

          </section>


          {/* =============================================== */}
          {/* MEETING SETTINGS */}
          {/* =============================================== */}

          <section
            id="meeting-settings"
            className="settings-card"
          >

            <div className="settings-card-header">

              <div className="settings-section-icon">
                <Video size={20} />
              </div>

              <div>
                <h2>Meeting</h2>
                <p>
                  Configure your default meeting
                  preferences.
                </p>
              </div>

            </div>


            {/* Audio */}

            <div className="settings-row">

              <div className="settings-row-left">

                <div className="settings-row-icon">
                  <Mic size={18} />
                </div>

                <div>
                  <strong>
                    Automatically join audio
                  </strong>

                  <p>
                    Join meeting audio automatically
                    when entering a meeting.
                  </p>
                </div>

              </div>

              <Toggle
                checked={settings.autoJoinAudio}
                onChange={(value) =>
                  updateSetting(
                    "autoJoinAudio",
                    value
                  )
                }
              />

            </div>


            {/* Video */}

            <div className="settings-row">

              <div className="settings-row-left">

                <div className="settings-row-icon">
                  <Camera size={18} />
                </div>

                <div>
                  <strong>
                    Automatically start video
                  </strong>

                  <p>
                    Start your camera automatically
                    when joining a meeting.
                  </p>
                </div>

              </div>

              <Toggle
                checked={settings.autoJoinVideo}
                onChange={(value) =>
                  updateSetting(
                    "autoJoinVideo",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* =============================================== */}
          {/* NOTIFICATIONS */}
          {/* =============================================== */}

          <section
            id="notification-settings"
            className="settings-card"
          >

            <div className="settings-card-header">

              <div className="settings-section-icon">
                <Bell size={20} />
              </div>

              <div>
                <h2>Notifications</h2>
                <p>
                  Choose which notifications you
                  want to receive.
                </p>
              </div>

            </div>


            {/* Meeting notifications */}

            <div className="settings-row">

              <div className="settings-row-left">

                <div className="settings-row-icon">
                  <Video size={18} />
                </div>

                <div>
                  <strong>
                    Meeting notifications
                  </strong>

                  <p>
                    Get notified about upcoming and
                    scheduled meetings.
                  </p>
                </div>

              </div>

              <Toggle
                checked={
                  settings.meetingNotifications
                }
                onChange={(value) =>
                  updateSetting(
                    "meetingNotifications",
                    value
                  )
                }
              />

            </div>


            {/* Chat notifications */}

            <div className="settings-row">

              <div className="settings-row-left">

                <div className="settings-row-icon">
                  <Bell size={18} />
                </div>

                <div>
                  <strong>
                    Chat notifications
                  </strong>

                  <p>
                    Receive notifications for new
                    chat messages.
                  </p>
                </div>

              </div>

              <Toggle
                checked={
                  settings.chatNotifications
                }
                onChange={(value) =>
                  updateSetting(
                    "chatNotifications",
                    value
                  )
                }
              />

            </div>

          </section>


          {/* =============================================== */}
          {/* AUDIO / VIDEO */}
          {/* =============================================== */}

          <section className="settings-card">

            <div className="settings-card-header">

              <div className="settings-section-icon">
                <Volume2 size={20} />
              </div>

              <div>
                <h2>Audio & Video</h2>
                <p>
                  Your camera and microphone permissions
                  are controlled by your browser.
                </p>
              </div>

            </div>


            <div className="device-info">

              <div className="device-item">

                <Mic size={18} />

                <div>
                  <strong>Microphone</strong>
                  <span>
                    Browser microphone access
                  </span>
                </div>

                <ChevronRight size={18} />

              </div>


              <div className="device-item">

                <Camera size={18} />

                <div>
                  <strong>Camera</strong>
                  <span>
                    Browser camera access
                  </span>
                </div>

                <ChevronRight size={18} />

              </div>

            </div>

            <p className="settings-note">
              Your browser may ask for microphone
              and camera permission when you join a
              meeting.
            </p>

          </section>


          {/* =============================================== */}
          {/* SAVE */}
          {/* =============================================== */}

          <div className="settings-save-area">

            {saved && (
              <div className="settings-saved">
                <Check size={17} />
                Settings saved
              </div>
            )}

            <button
              className="settings-save-button"
              onClick={saveSettings}
            >
              Save Changes
            </button>

          </div>

        </main>

      </div>

    </div>
  );
}