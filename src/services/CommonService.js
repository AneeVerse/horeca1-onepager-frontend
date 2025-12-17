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
  const testUrl = `${baseURL}/setting/global`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        connected: false,
        status: response.status,
        message: `Backend returned status ${response.status}: ${errorText.substring(0, 100)}`,
        url: testUrl,
      };
    }
    
    return {
      connected: true,
      status: response.status,
      message: 'Backend connected successfully!',
      url: testUrl,
    };
  } catch (error) {
    let errorMessage = error.message || 'Failed to connect to backend';
    
    if (error.name === 'AbortError') {
      errorMessage = `Request timed out after 10 seconds. The backend at ${testUrl} is not responding. Check if:
- The backend URL is correct
- The backend is deployed and running
- CORS is configured to allow requests from this domain`;
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = `Network error: Cannot reach ${testUrl}. Check if:
- The backend URL is correct
- The backend is accessible from the internet
- There are no firewall restrictions`;
    }
    
    return {
      connected: false,
      status: 0,
      message: errorMessage,
      error: error.name,
      url: testUrl,
    };
  }
};

export { baseURL, handleResponse, checkBackendConnection };
