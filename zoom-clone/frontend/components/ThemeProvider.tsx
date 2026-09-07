"use client";

import { useEffect } from "react";

export default function ThemeProvider() {
  useEffect(() => {
    const storedSettings =
      localStorage.getItem("zoom_settings");

    let theme = "light";

    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);

        theme = settings.theme || "light";

        if (theme === "system") {
          theme = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches
            ? "dark"
            : "light";
        }
      } catch {
        theme = "light";
      }
    }

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );
  }, []);

  return null;
}