"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

//internal import
import useUtilsFunction from "@hooks/useUtilsFunction";

const CategoryCardItem = ({ category }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  const handleCategoryClick = () => {
    const categoryName = showingTranslateValue(category?.name);
    if (!categoryName || !category?._id) return;
    
    const category_name = categoryName
      .toLowerCase()
      .replace(/[^A-Z0-9]+/gi, "-");
    const url = `/search?category=${category_name}&_id=${category._id}`;
    router.push(url);
  };

  return (
    <div
      onClick={handleCategoryClick}
      className="flex flex-col items-center w-20 sm:w-24 md:w-28 cursor-pointer transition duration-200 ease-linear group-hover:-translate-y-1"
    >
      {/* Image Section - Rounded light bg like Blinkit */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
        {category.icon ? (
          <Image
            src={category.icon}
            alt={category.name || "category"}
            width={100}
            height={100}
            className="object-contain p-1"
          />
        ) : (
          <Image
            src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
            alt="category"
            width={80}
            height={80}
            className="object-contain p-1"
          />
        )}
      </div>
      {/* Text Below - No box, just text */}
      <h3 className="text-xs sm:text-sm text-gray-800 font-medium leading-tight line-clamp-2 text-center hover:text-primary-600">
        {showingTranslateValue(category?.name)}
      </h3>
    </div>
  );
};

export default CategoryCardItem;



