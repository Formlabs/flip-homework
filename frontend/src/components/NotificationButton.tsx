"use client";

import { useState, useEffect } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  initializeNotifications,
} from "@/lib/notifications";

export function NotificationButton() {
  const [permission, setPermission] = useState<"granted" | "denied" | "default">("default");
  const [isRequesting, setIsRequesting] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isNotificationSupported());
    if (isNotificationSupported()) {
      setPermission(getNotificationPermission());
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    try {
      const granted = await initializeNotifications();
      setPermission(granted ? "granted" : "denied");
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      setPermission("denied");
    } finally {
      setIsRequesting(false);
    }
  };

  if (!supported) {
    return null;
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-xs text-green-400/80">
        <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Notifications enabled
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="text-xs text-zinc-500">
        Notifications blocked (check browser settings)
      </div>
    );
  }

  return (
    <button
      onClick={handleEnableNotifications}
      disabled={isRequesting}
      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRequesting ? "Enabling..." : "🔔 Enable Notifications"}
    </button>
  );
}
