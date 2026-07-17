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

// Endpoints where a 401 is a form error the page shows inline — a bad
// password, a wrong OTP code, an expired reset token — NOT an expired session.
// These are the pre-login credential submissions; redirecting away from them
// would throw the user off the form (and off a reset link that carries a
// token in its URL). Every other 401 — including /auth/me and any authed call
// whose token has expired mid-session — means a dead session and redirects.
const FORM_401_ENDPOINTS = [
  "/auth/login",
  "/auth/otp/verify",
  "/auth/reset-password",
];

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? "";
    const isFormError = FORM_401_ENDPOINTS.some((endpoint) =>
      url.includes(endpoint),
    );
    if (
      error.response?.status === 401 &&
      !isFormError &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
