import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // A 401 from an auth endpoint (bad password, wrong OTP code, expired
    // reset token) is a form error, not an expired session — let the page
    // display it instead of redirecting.
    const isAuthRequest = error.config?.url?.includes("/auth/");
    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
