//internal import
import { Suspense } from "react";
import SearchScreen from "@components/search/SearchScreen";
import FeatureCategory from "@components/category/FeatureCategory";
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
  const { _id, query, priceMin, priceMax, categories, brands, inStock, sortBy } = await searchParams;

  const { products, error } = await getShowingStoreProducts({
    category: _id ? _id : "",
    title: query ? encodeURIComponent(query) : "",
  });
  const { attributes } = await getShowingAttributes();
  const { categories: allCategories } = await getShowingCategory();
  const { globalSetting } = await getGlobalSetting();
  const currency = globalSetting?.default_currency || "₹";

  // Parse filter params from URL
  const filterParams = {
    priceMin: priceMin || "",
    priceMax: priceMax || "",
    selectedCategories: categories ? categories.split(",").filter(Boolean) : [],
    selectedBrands: brands ? brands.split(",").filter(Boolean) : [],
    inStock: inStock ? inStock === "true" : null,
    sortBy: sortBy || "",
  };

  return (
    <>
      {/* SearchScreen handles sidebar layout for both mobile and desktop */}
      <SearchScreen
        products={products}
        attributes={attributes}
        categories={allCategories}
        currency={currency}
        initialFilters={filterParams}
      />
    </>
  );
};

export default Search;

