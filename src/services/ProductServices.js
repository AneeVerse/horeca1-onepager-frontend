import { baseURL, handleResponse } from "@services/CommonService";

const getShowingStoreProducts = async ({
  category = "",
  title = "",
  slug = "",
}) => {
  try {
    // console.log("slug::", slug);
    const apiUrl = `${baseURL}/products/store?category=${category}&title=${title}&slug=${slug}`;
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductServices.js:12',message:'API request URL',data:{apiUrl,category,title,slug},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(
      apiUrl,
      {
        // cache: "no-cache",
        next: {
          revalidate: 60,
          tags: ["store_products"],
        },
      }
    );

    const products = await handleResponse(response);
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProductServices.js:30',message:'API response data',data:{productsCount:products?.products?.length||0,popularProductsCount:products?.popularProducts?.length||0,discountedProductsCount:products?.discountedProducts?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    return {
      error: null,
      reviews: products.reviews,
      products: products.products,
      relatedProducts: products.relatedProducts,
      popularProducts: products.popularProducts,
      discountedProducts: products.discountedProducts,
    };
  } catch (error) {
    return {
      products: [],
      relatedProducts: [],
      popularProducts: [],
      discountedProducts: [],
      error: error.message,
    };
  }
};

export { getShowingStoreProducts };
