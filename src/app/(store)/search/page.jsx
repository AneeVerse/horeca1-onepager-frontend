//internal import

import SearchScreen from "@components/search/SearchScreen";
import { getShowingAttributes } from "@services/AttributeServices";
import { getShowingCategory } from "@services/CategoryService";
import { getShowingStoreProducts } from "@services/ProductServices";
import { getGlobalSetting } from "@services/SettingServices";
// import Loading from "./loading";

// import { useSearchParams } from "next/navigation";

export async function generateMetadata({ searchParams }) {
  const { _id, query } = await searchParams;

  const { products, error } = await getShowingStoreProducts({
    category: _id ? _id : "",
    title: query ? encodeURIComponent(query) : "",
  });

  const product = products[0];

  return {
    title: `${product?.title?.en || "Search"} | Horeca1`,
    description: product?.description?.en,
    keywords: [product?.tags],
    openGraph: {
      images: [product?.image],
    },
  };
}

const Search = async ({ searchParams }) => {
  //   const searchParams = useSearchParams();

  const { _id, query } = await searchParams;
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search/page.jsx:35',message:'Search params received',data:{_id,query},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const categoryParam = _id ? _id : "";
  const titleParam = query ? encodeURIComponent(query) : "";
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search/page.jsx:42',message:'Params being sent to API',data:{categoryParam,titleParam},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const { products, error } = await getShowingStoreProducts({
    category: categoryParam,
    title: titleParam,
  });
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/7c8b8306-06cf-4e61-b56f-4a46c890ce31',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search/page.jsx:48',message:'API response received',data:{productsCount:products?.length||0,error:error||null},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const { attributes } = await getShowingAttributes();
  const { categories } = await getShowingCategory();
  const { globalSetting } = await getGlobalSetting();
  const currency = globalSetting?.default_currency || "$";

  //   console.log("searchParams", searchParams, "query", query, "_id", _id);

  return (
    <>
      <SearchScreen
        products={products}
        attributes={attributes}
        categories={categories}
        currency={currency}
      />
    </>
  );
};

export default Search;
