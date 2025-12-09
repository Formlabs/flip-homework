export type NotificationPermission = "granted" | "denied" | "default";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission as NotificationPermission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    throw new Error("Notifications not supported");
  }
  
  const permission = await Notification.requestPermission();
  return permission as NotificationPermission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isNotificationSupported()) return null;
  
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    
    console.log("Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

export async function showNotification(
  title: string,
  options: {
    body: string;
    orderId?: number;
    tag?: string;
  }
): Promise<void> {
  if (!isNotificationSupported()) {
    throw new Error("Notifications not supported");
  }
  
  const permission = getNotificationPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission not granted");
  }
  
  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification(title, {
    body: options.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: { orderId: options.orderId },
    tag: options.tag || `order-${options.orderId}`,
    requireInteraction: false,
  });
}

export async function initializeNotifications(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported");
    return false;
  }
  
  const registration = await registerServiceWorker();
  if (!registration) {
    console.error("Failed to register service worker");
    return false;
  }
  
  const permission = await requestNotificationPermission();
  return permission === "granted";
}
