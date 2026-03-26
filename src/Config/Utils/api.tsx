import { API_BASE } from "../Config/api";

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Auto handle unauthorized
  if (response.status === 401) {
    window.location.href = "/login";
    return null;
  }

  return response;
};
