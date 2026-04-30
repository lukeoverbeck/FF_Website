import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── cn ──
// Utility that merges clsx conditional class lists with tailwind-merge, so conflicting Tailwind classes are
// resolved correctly (e.g. "p-2 p-4" → "p-4"). Used throughout the component layer via the cn() import.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── authFetch ──
// Drop-in replacement for fetch() that automatically attaches the stored JWT as a Bearer Authorization header.
// On a 401 response the token is cleared from localStorage
// and the user is hard-redirected to /login, preventing stale sessions from reaching protected API routes.
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  // Merge headers with the token
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  // Passes original options and overwrites headers with the merged headers
  const response = await fetch(url, { ...options, headers });

  // Bad token -> remove and send user to login page
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null;
  }

  // Return the raw response from the endpoint
  return response;
};

// ── logToBackend ──
// Fire-and-forget logger that forwards frontend errors to /api/log so they are captured in the server's
// structured log output alongside backend events.
export const logToBackend = (level, message) => {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, message }),
  });
};
