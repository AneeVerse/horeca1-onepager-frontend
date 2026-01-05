"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SearchSuggestions = ({
  suggestions = [],
  searchText = "",
  isOpen,
  onClose,
  onSelect,
  selectedIndex,
  currency = "₹"
}) => {
  const router = useRouter();
  const { showingTranslateValue, getNumberTwo } = useUtilsFunction();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !suggestions || suggestions.length === 0) {
    return null;
  }

  const handleSuggestionClick = (product) => {
    const productName = showingTranslateValue(product?.title) || product?.title || "";
    if (productName) {
      router.push(`/search?query=${encodeURIComponent(productName)}`, { scroll: true });
    }
    onSelect();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto"
    >
      <div className="py-1">
        {suggestions.map((product, index) => {
          const productName = showingTranslateValue(product?.title) || product?.title || "Product";
          const productPrice = product?.prices?.price || product?.price || 0;
          const productImage = product?.image?.[0] || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";

          return (
            <div
              key={product._id || product.id || index}
              onClick={() => handleSuggestionClick(product)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${index === selectedIndex
                ? "bg-primary-50 border-l-4 border-primary-600"
                : "hover:bg-gray-50"
                }`}
            >
              <div className="flex-shrink-0 w-12 h-12 relative">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-cover rounded"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {productName}
                </p>
                <p className="text-xs text-gray-500">
                  {currency}{getNumberTwo(productPrice)}
                  {product?.unit && ` / ${product.unit}`}
                </p>
              </div>
            </div>
          );
        })}

        {/* Search All Link */}
        <div
          onClick={() => {
            router.push(`/search?query=${encodeURIComponent(searchText)}`, { scroll: true });
            onSelect();
          }}
          className="px-4 py-3 bg-gray-50 border-t border-gray-100 cursor-pointer hover:bg-primary-50 hover:text-primary-700 text-center transition-colors shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-10"
        >
          <p className="text-sm font-bold text-primary-600 flex items-center justify-center gap-2">
            See all matching results for "{searchText}"
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;

