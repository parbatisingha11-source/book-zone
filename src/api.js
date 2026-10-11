const API_URL = import.meta.env.VITE_API_URL || "/api";

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("libraryToken");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 502) {
      throw new Error("The API server is unavailable. Start the backend and verify its database connection.");
    }
    throw new Error(data.message || `Request failed (${response.status}).`);
  }
  return data;
};
