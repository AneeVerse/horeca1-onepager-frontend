import { baseURL } from "./CommonService";

// Get all active banners for homepage
export const getBanners = async () => {
  try {
    const response = await fetch(`${baseURL}/banners/`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch banners");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

// Get all banners for admin (including inactive)
export const getAllBannersAdmin = async () => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:getAllBannersAdmin',message:'getAllBannersAdmin called',data:{baseURL:typeof baseURL !== 'undefined' ? baseURL : 'undefined',hasAdminToken:!!localStorage.getItem("adminToken")},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
  // #endregion
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required. Please login.");
    }
    
    const apiUrl = `${baseURL}/banners/admin`;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:getAllBannersAdmin',message:'Making API request',data:{apiUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      cache: "no-store",
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:getAllBannersAdmin',message:'Response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,contentType:response.headers.get("content-type"),url:response.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
    // #endregion
    
    if (!response.ok) {
      // Read response body only once
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to fetch banners";
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        // If response is HTML (like 404 page), consume it and provide helpful message
        await response.text(); // Consume the response to avoid stream error
        if (response.status === 404) {
          errorMessage = "Banner API endpoint not found. Please check backend server.";
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status}). Please check backend server.`;
        }
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
};

// Add a new banner
export const addBanner = async (bannerData) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:addBanner',message:'addBanner called',data:{hasAdminToken:!!localStorage.getItem("adminToken"),baseURL:typeof baseURL !== 'undefined' ? baseURL : 'undefined',bannerDataKeys:Object.keys(bannerData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }
    
    const apiUrl = `${baseURL}/banners/admin`;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:addBanner',message:'Making API request',data:{apiUrl,method:'POST',hasToken:!!adminToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(bannerData),
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:addBanner',message:'Response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,contentType:response.headers.get("content-type"),url:response.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (!response.ok) {
      // Read response body only once
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to add banner";
      let errorBody = null;
      
      if (contentType && contentType.includes("application/json")) {
        errorBody = await response.json();
        errorMessage = errorBody.message || errorMessage;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:addBanner',message:'Error response JSON',data:{status:response.status,errorBody},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } else {
        const errorText = await response.text();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:addBanner',message:'Error response text',data:{status:response.status,contentType,errorTextPreview:errorText.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        if (response.status === 404) {
          errorMessage = "Banner API endpoint not found. Please check backend server.";
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}`;
        }
      }
      throw new Error(errorMessage);
    }
    const result = await response.json();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:addBanner',message:'Success',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    return result;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BannerService.js:addBanner',message:'Exception caught',data:{errorMessage:error.message,errorName:error.name,errorStack:error.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    console.error("Error adding banner:", error);
    throw error;
  }
};

// Update a banner
export const updateBanner = async (id, bannerData) => {
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }
    
    const response = await fetch(`${baseURL}/banners/admin/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(bannerData),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to update banner";
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        await response.text(); // Consume the response
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status})`;
        }
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};

// Delete a banner
export const deleteBanner = async (id) => {
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }
    
    const response = await fetch(`${baseURL}/banners/admin/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to delete banner";
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        await response.text(); // Consume the response
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status})`;
        }
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};

// Reorder banners
export const reorderBanners = async (banners) => {
  try {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin authentication required");
    }
    
    const response = await fetch(`${baseURL}/banners/admin/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ banners }),
    });
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to reorder banners";
      
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        await response.text(); // Consume the response
        if (response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else {
          errorMessage = `Server error (${response.status})`;
        }
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error("Error reordering banners:", error);
    throw error;
  }
};

