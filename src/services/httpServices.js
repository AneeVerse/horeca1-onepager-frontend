import axios from "axios";

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

