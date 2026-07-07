export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // We proxy backend API requests using an explicit /api prefix
    // which Next.js forwards to the backend via rewrites in next.config.ts.
    return "/api";
  }
  // Fallback for SSR using backend IP
  return "http://192.168.10.90:5000";
};

export const API_BASE_URL = getBaseUrl();
