"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import useUtilsFunction from "@hooks/useUtilsFunction";

const AdvancedFilters = ({
  categories = [],
  brands = [],
  filters = {},
  onFilterChange,
  currency = "₹",
}) => {
  const { showingTranslateValue } = useUtilsFunction();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    priceMin: filters.priceMin || "",
    priceMax: filters.priceMax || "",
    selectedCategories: filters.selectedCategories || [],
    selectedBrands: filters.selectedBrands || [],
    inStock: filters.inStock !== undefined ? filters.inStock : null,
    sortBy: filters.sortBy || "",
  });

  useEffect(() => {
    setLocalFilters({
      priceMin: filters.priceMin || "",
      priceMax: filters.priceMax || "",
      selectedCategories: filters.selectedCategories || [],
      selectedBrands: filters.selectedBrands || [],
      inStock: filters.inStock !== undefined ? filters.inStock : null,
      sortBy: filters.sortBy || "",
    });
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const toggleCategory = (categoryId) => {
    const updated = localFilters.selectedCategories.includes(categoryId)
      ? localFilters.selectedCategories.filter((id) => id !== categoryId)
      : [...localFilters.selectedCategories, categoryId];
    handleFilterChange("selectedCategories", updated);
  };

  const toggleBrand = (brand) => {
    const updated = localFilters.selectedBrands.includes(brand)
      ? localFilters.selectedBrands.filter((b) => b !== brand)
      : [...localFilters.selectedBrands, brand];
    handleFilterChange("selectedBrands", updated);
  };

  const clearFilters = () => {
    const cleared = {
      priceMin: "",
      priceMax: "",
      selectedCategories: [],
      selectedBrands: [],
      inStock: null,
      sortBy: "",
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = [
    localFilters.priceMin,
    localFilters.priceMax,
    localFilters.selectedCategories.length,
    localFilters.selectedBrands.length,
    localFilters.inStock !== null,
    localFilters.sortBy,
  ].filter(Boolean).length;

  // Get unique brands from products
  const uniqueBrands = brands.filter(
    (brand, index, self) => brand && self.indexOf(brand) === index
  );

  return (
    <div className="w-full sm:w-64 lg:w-72 flex-shrink-0 border-r border-gray-200 pr-4">
      {/* Mobile: Collapsible Header */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <span className="font-medium text-gray-700">
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Desktop: Always visible, Mobile: Collapsible */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } sm:block sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto py-2 sm:py-4`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                <input
                  type="number"
                  value={localFilters.priceMin}
                  onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                <input
                  type="number"
                  value={localFilters.priceMax}
                  onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                  placeholder="No limit"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => {
                  const categoryName = showingTranslateValue(category?.name) || category?.name || "Category";
                  const isSelected = localFilters.selectedCategories.includes(category._id);
                  return (
                    <label
                      key={category._id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(category._id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{categoryName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brands */}
          {uniqueBrands.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Brands</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uniqueBrands.map((brand, index) => {
                  const isSelected = localFilters.selectedBrands.includes(brand);
                  return (
                    <label
                      key={index}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBrand(brand)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Stock Status</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="stockStatus"
                  checked={localFilters.inStock === true}
                  onChange={() => handleFilterChange("inStock", true)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">In Stock</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="stockStatus"
                  checked={localFilters.inStock === false}
                  onChange={() => handleFilterChange("inStock", false)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Out of Stock</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="stockStatus"
                  checked={localFilters.inStock === null}
                  onChange={() => handleFilterChange("inStock", null)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">All</span>
              </label>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;

