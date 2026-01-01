import { baseURL, handleResponse } from "@services/CommonService";

/**
 * Get search suggestions based on query
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of suggestions (default: 5)
 * @returns {Promise<Array>} Array of product suggestions
 */
export const getSearchSuggestions = async (query, limit = 5) => {
  if (!query || query.trim().length < 1) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `${baseURL}/products/store?title=${encodeURIComponent(query.trim())}&limit=${limit}`,
      {
        signal: controller.signal,
        next: {
          revalidate: 60,
          tags: ["search_suggestions"],
        },
      }
    );
    
    clearTimeout(timeoutId);
    const data = await handleResponse(response);

    // Return only the products array, limited to the specified limit
    const products = data?.products || [];
    return products.slice(0, limit);
  } catch (error) {
    console.error('Error fetching search suggestions:', error.message);
    return [];
  }
};

