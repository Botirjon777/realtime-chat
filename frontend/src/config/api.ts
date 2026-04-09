export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // If we're in a browser, use the current host (works for localhost and local network IPs)
    return `http://${window.location.hostname}:5000`;
  }
  // Fallback for SSR
  return "http://localhost:5000";
};

export const API_BASE_URL = getBaseUrl();
