// Validate API base URL
const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url || url === 'undefined') {
    console.error('❌ NEXT_PUBLIC_API_BASE_URL is not set! Please check your environment variables.');
    throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL in your environment variables.');
  }
  return url;
};

const baseURL = getBaseURL();

// console.log("baseUrl", baseURL);

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message || "Failed to fetch data");
  }

  return response.json();
};

// Connection checker utility
const checkBackendConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${baseURL}/setting/global`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return {
      connected: response.ok,
      status: response.status,
      message: response.ok ? 'Backend connected successfully!' : `Backend returned status ${response.status}`,
    };
  } catch (error) {
    return {
      connected: false,
      status: 0,
      message: error.message || 'Failed to connect to backend',
      error: error.name,
    };
  }
};

export { baseURL, handleResponse, checkBackendConnection };
