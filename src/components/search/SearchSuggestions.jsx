"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SearchSuggestions = ({ 
  suggestions = [], 
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
    if (product?.slug) {
      router.push(`/products/${product.slug}`);
    } else if (product?._id) {
      router.push(`/products/${product._id}`);
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
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex
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
      </div>
    </div>
  );
};

export default SearchSuggestions;

