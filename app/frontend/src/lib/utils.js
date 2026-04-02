import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
