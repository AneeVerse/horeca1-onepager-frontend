import axios from "axios";
import Cookies from "js-cookie";

// Validate API base URL
const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url || url === 'undefined') {
    console.error('❌ NEXT_PUBLIC_API_BASE_URL is not set! Please check your environment variables.');
    return ''; // Return empty string to avoid undefined in URLs
  }
  return url;
};

// console.log("httpServices Base_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 50000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle token expiration gracefully
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to authentication failure (401 or 403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const errorMessage = error.response.data?.message || '';

      // Check if it's a JWT-related error
      if (
        errorMessage.toLowerCase().includes('jwt') ||
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('expire') ||
        errorMessage.toLowerCase().includes('authorization') ||
        errorMessage.toLowerCase().includes('unauthorized')
      ) {
        console.warn('🔐 Session expired or invalid. Logging out user...');

        // Clear user data from cookies
        Cookies.remove("userInfo");
        Cookies.remove("couponInfo");

        // Only redirect if we're in the browser (client-side)
        if (typeof window !== 'undefined') {
          // Get current path for redirect after login
          const currentPath = window.location.pathname;

          // Don't redirect if already on login/auth pages
          if (!currentPath.includes('/auth/') && !currentPath.includes('/login')) {
            // Redirect to login with return URL
            window.location.href = `/auth/otp-login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export const setToken = (token) => {
  // console.log("token", token);
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common["Authorization"];
  }
};

const responseBody = (response) => response.data;

const requests = {
  get: (url, body) => instance.get(url, body).then(responseBody),
  post: (url, body, headers) =>
    instance.post(url, body, headers).then(responseBody),
  put: (url, body) => instance.put(url, body).then(responseBody),
};

export default requests;

