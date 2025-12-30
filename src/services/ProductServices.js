import { baseURL, handleResponse } from "@services/CommonService";

const getShowingStoreProducts = async ({
  category = "",
  title = "",
  slug = "",
}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for cold starts
    
    const response = await fetch(
      `${baseURL}/products/store?category=${category}&title=${title}&slug=${slug}`,
      {
        signal: controller.signal,
        next: {
          revalidate: 60,
          tags: ["store_products"],
        },
      }
    );
    
    clearTimeout(timeoutId);
    const products = await handleResponse(response);

    return {
      error: null,
      reviews: products?.reviews || [],
      products: products?.products || [],
      relatedProducts: products?.relatedProducts || [],
      popularProducts: products?.popularProducts || [],
      discountedProducts: products?.discountedProducts || [],
    };
  } catch (error) {
    console.error('Error fetching store products:', error.message);
    return {
      products: [],
      relatedProducts: [],
      popularProducts: [],
      discountedProducts: [],
      reviews: [],
      error: error.message,
    };
  }
};

export { getShowingStoreProducts };

