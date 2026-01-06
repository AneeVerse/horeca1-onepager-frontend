"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

//internal import
import useFilter from "@hooks/useFilter";
import ProductCard from "@components/product/ProductCard";
import { Button } from "@components/ui/button";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SearchScreen = ({ products, attributes, categories, currency, initialFilters = {} }) => {
  const [visibleProduct, setVisibleProduct] = useState(18);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showingTranslateValue } = useUtilsFunction();

  useEffect(() => setMounted(true), []);

  // Get filter values from URL params or initialFilters prop
  const [filters, setFilters] = useState({
    priceMin: searchParams.get("priceMin") || initialFilters.priceMin || "",
    priceMax: searchParams.get("priceMax") || initialFilters.priceMax || "",
    selectedCategories: searchParams.get("categories")?.split(",").filter(Boolean) || initialFilters.selectedCategories || [],
    selectedBrands: searchParams.get("brands")?.split(",").filter(Boolean) || initialFilters.selectedBrands || [],
    inStock: searchParams.get("inStock") ? searchParams.get("inStock") === "true" : (initialFilters.inStock !== undefined ? initialFilters.inStock : null),
    sortBy: searchParams.get("sortBy") || initialFilters.sortBy || "",
  });

  // Extract unique brands from products
  const brands = Array.from(
    new Set(
      products
        ?.map((p) => p.brand)
        .filter(Boolean)
    )
  );

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    // Update URL with filter params
    const params = new URLSearchParams();

    if (searchParams.get("query")) {
      params.set("query", searchParams.get("query"));
    }
    if (searchParams.get("_id")) {
      params.set("_id", searchParams.get("_id"));
    }

    if (newFilters.priceMin) params.set("priceMin", newFilters.priceMin);
    if (newFilters.priceMax) params.set("priceMax", newFilters.priceMax);
    if (newFilters.selectedCategories.length > 0) {
      params.set("categories", newFilters.selectedCategories.join(","));
    }
    if (newFilters.selectedBrands.length > 0) {
      params.set("brands", newFilters.selectedBrands.join(","));
    }
    if (newFilters.inStock !== null) {
      params.set("inStock", newFilters.inStock.toString());
    }
    if (newFilters.sortBy) {
      params.set("sortBy", newFilters.sortBy);
    }

    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const removeFilter = (filterType, value = null) => {
    const updated = { ...filters };

    switch (filterType) {
      case "priceMin":
        updated.priceMin = "";
        break;
      case "priceMax":
        updated.priceMax = "";
        break;
      case "category":
        updated.selectedCategories = updated.selectedCategories.filter((id) => id !== value);
        break;
      case "brand":
        updated.selectedBrands = updated.selectedBrands.filter((b) => b !== value);
        break;
      case "inStock":
        updated.inStock = null;
        break;
      case "sortBy":
        updated.sortBy = "";
        break;
      default:
        break;
    }

    handleFilterChange(updated);
  };

  const { setSortedField, productData } = useFilter(products, filters);
  if (!mounted) return null; // or a skeleton loader

  const categoryList = categories?.[0]?.children || [];

  const handleCategoryClick = (categoryId, categoryName) => {
    if (categoryId === null || categoryId === "all") {
      // Clear category filter - show all products
      router.push(`/search`);
    } else {
      const category_name = categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");
      router.push(`/search?category=${category_name}&_id=${categoryId}`);
    }
  };

  // Get active filter chips
  const activeFilters = [];
  if (filters.priceMin) {
    activeFilters.push({ type: "priceMin", label: `Min: ${currency}${filters.priceMin}`, value: filters.priceMin });
  }
  if (filters.priceMax) {
    activeFilters.push({ type: "priceMax", label: `Max: ${currency}${filters.priceMax}`, value: filters.priceMax });
  }
  filters.selectedCategories.forEach((catId) => {
    const category = categoryList.find((c) => c._id === catId);
    if (category) {
      activeFilters.push({ type: "category", label: showingTranslateValue(category.name), value: catId });
    }
  });
  filters.selectedBrands.forEach((brand) => {
    activeFilters.push({ type: "brand", label: brand, value: brand });
  });
  if (filters.inStock !== null) {
    activeFilters.push({ type: "inStock", label: filters.inStock ? "In Stock" : "Out of Stock", value: filters.inStock });
  }
  if (filters.sortBy) {
    const sortLabels = {
      "price-low": "Price: Low to High",
      "price-high": "Price: High to Low",
      "name-asc": "Name: A to Z",
      "name-desc": "Name: Z to A",
      "newest": "Newest First",
      "oldest": "Oldest First",
    };
    activeFilters.push({ type: "sortBy", label: sortLabels[filters.sortBy] || filters.sortBy, value: filters.sortBy });
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-10">
      <div className="flex py-6 sm:py-10 lg:py-12">
        <div className="flex w-full gap-3 sm:gap-4">
          {/* Categories sidebar on left - hidden on mobile, visible on desktop */}
          <div className="hidden sm:block w-20 sm:w-32 lg:w-40 flex-shrink-0 border-r border-gray-200">
            <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto py-2 sm:py-4">
              <ul className="flex flex-col gap-2">
                {/* All tab with product-header image */}
                <li className="w-full">
                  <div
                    onClick={() => handleCategoryClick(null, "All")}
                    className="flex flex-col items-center p-2 sm:p-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Image
                      src="/product-header.png"
                      alt="All Products"
                      width={32}
                      height={32}
                      className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain mb-1 sm:mb-2"
                    />
                    <span className="text-[10px] sm:text-xs lg:text-sm text-gray-700 font-medium leading-tight line-clamp-2 text-center hover:text-primary-600">
                      All
                    </span>
                  </div>
                </li>
                {categoryList.map((category, i) => (
                  <li key={i + 1} className="w-full">
                    <div
                      onClick={() => handleCategoryClick(category._id, showingTranslateValue(category?.name))}
                      className="flex flex-col items-center p-2 sm:p-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {category.icon ? (
                        <Image
                          src={category.icon}
                          alt={category.name || "category"}
                          width={32}
                          height={32}
                          className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain mb-1 sm:mb-2"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full mb-1 sm:mb-2" />
                      )}
                      <span className="text-[10px] sm:text-xs lg:text-sm text-gray-700 font-medium leading-tight line-clamp-2 text-center hover:text-primary-600">
                        {showingTranslateValue(category?.name)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full"
                  >
                    {filter.label}
                    <button
                      onClick={() => removeFilter(filter.type, filter.value)}
                      className="ml-1 hover:text-primary-900"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {productData?.length === 0 ? (
              <div className="mx-auto p-5 my-5">
                <Image
                  className="my-4 mx-auto"
                  src="/no-result.svg"
                  alt="no-result"
                  width={400}
                  height={380}
                />
                <h2 className="text-lg md:text-xl lg:text-2xl xl:text-2xl text-center mt-2 font-medium text-gray-600">
                  Sorry, we can not find this product 😞
                </h2>
              </div>
            ) : (
              <div className="flex justify-between items-center my-3 bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4">
                <h6 className="text-sm font-medium text-gray-700">
                  Total <span className="font-bold text-primary-600">{productData?.length}</span>{" "}
                  Items Found
                </h6>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-1.5 min-[300px]:gap-2 sm:gap-3 md:gap-4 lg:gap-4">
              {productData?.slice(0, visibleProduct).map((product, i) => (
                <ProductCard
                  key={i + 1}
                  product={product}
                  attributes={attributes}
                  currency={currency}
                />
              ))}
            </div>

            {productData?.length > visibleProduct && (
              <Button
                onClick={() => setVisibleProduct((pre) => pre + 10)}
                variant="create"
                className="w-auto mx-auto md:text-sm leading-5 flex items-center transition ease-in-out duration-300 font-medium text-center justify-center px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 mt-6"
              >
                Load More
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(SearchScreen), { ssr: false });

