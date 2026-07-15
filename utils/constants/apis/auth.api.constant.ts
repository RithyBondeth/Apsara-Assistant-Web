import { API_V1 } from "./base.api.constant";

export const AUTH_API = {
  LOGIN: `${API_V1}/auth/login`,
  REGISTER: `${API_V1}/auth/register`,
  LOGOUT: `${API_V1}/auth/logout`,
  ME: `${API_V1}/auth/me`,
  REFRESH: `${API_V1}/auth/refresh`,
  FORGOT_PASSWORD: `${API_V1}/auth/forgot-password`,
  RESET_PASSWORD: `${API_V1}/auth/reset-password`,
  OTP_REQUEST: `${API_V1}/auth/otp/request`,
  OTP_VERIFY: `${API_V1}/auth/otp/verify`,
};
