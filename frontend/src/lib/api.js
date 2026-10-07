// Where the Flask backend lives.
// - Local dev / Docker: the Flask server on port 5001
// - Production (Vercel): same site under /api
// Set VITE_API_URL to override either one.
export const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:5001" : "/api");
