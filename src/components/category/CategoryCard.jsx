import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoRemoveSharp,
} from "react-icons/io5";

import useUtilsFunction from "@hooks/useUtilsFunction";

const CategoryCard = ({ title, icon, nested, id, onClose }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  const [show, setShow] = useState(false);
  const [showSubCategory, setShowSubCategory] = useState({
    id: "",
    show: false,
  });

  // ✅ Search only when clicking on the category name
  const handleSearch = (id, categoryName) => {
    if (!id || id === "all") {
      router.push("/search");
    } else {
      const name = categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");
      router.push(`/search?category=${name}&_id=${id}`);
    }
    if (onClose) {
      onClose();
    }
  };

  // ✅ Toggle expand only when clicking the arrow/icon
  const toggleExpand = () => {
    setShow(!show);
  };

  const handleSubNestedToggle = (id) => {
    setShowSubCategory({
      id: id,
      show: showSubCategory.id === id ? !showSubCategory.show : true,
    });
  };

  return (
    <>
      <div
        onClick={() => handleSearch(id, title)}
        className="flex flex-col items-center justify-start p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group w-full"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-slate-100 rounded-2xl mb-2 group-hover:bg-white group-hover:shadow-md transition-all overflow-hidden border border-gray-100">
          {id === null ? (
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transform group-hover:scale-110 transition-transform duration-300"
            >
              {/* Top Left Rounded Square */}
              <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" stroke="#374151" strokeWidth="2" />
              {/* Top Right Rounded Square */}
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" stroke="#374151" strokeWidth="2" />
              {/* Bottom Left Rounded Square */}
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" stroke="#374151" strokeWidth="2" />
              {/* Bottom Right Dot - Website Theme Color */}
              <circle cx="17.25" cy="17.25" r="4.5" fill="#018549" />
            </svg>
          ) : icon ? (
            <Image
              src={icon}
              width={100}
              height={100}
              alt={title}
              className="object-contain p-1"
            />
          ) : (
            <Image
              src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
              width={100}
              height={100}
              alt="category"
              className="object-contain p-1 opacity-50"
            />
          )}
        </div>

        <div className="text-xs sm:text-sm font-medium text-gray-800 text-center leading-tight line-clamp-2 max-w-full group-hover:text-primary-600 transition-colors">
          {title}
        </div>
      </div>

      {/* Nested categories */}
      {show && nested.length > 0 && (
        <ul className="pl-6 pb-3 pt-1 -mt-1">
          {nested.map((children) => (
            <li key={children._id}>
              {children.children.length > 0 ? (
                <div className="flex items-center py-1">
                  <span className="text-xs text-gray-500 pr-2">
                    <IoRemoveSharp />
                  </span>
                  <div
                    onClick={() =>
                      handleSearch(
                        children._id,
                        showingTranslateValue(children.name)
                      )
                    }
                    className="flex-1 text-sm text-gray-600 hover:text-primary-600 cursor-pointer"
                  >
                    {showingTranslateValue(children.name)}
                  </div>
                  <span
                    onClick={() => handleSubNestedToggle(children._id)}
                    className="cursor-pointer text-gray-400 hover:text-primary-600"
                  >
                    {showSubCategory.id === children._id &&
                      showSubCategory.show ? (
                      <IoChevronDownOutline />
                    ) : (
                      <IoChevronForwardOutline />
                    )}
                  </span>
                </div>
              ) : (
                <div
                  onClick={() =>
                    handleSearch(
                      children._id,
                      showingTranslateValue(children.name)
                    )
                  }
                  className="flex items-center py-1 text-sm text-gray-600 hover:text-primary-600 cursor-pointer"
                >
                  <span className="text-xs text-gray-500 pr-2">
                    <IoRemoveSharp />
                  </span>
                  {showingTranslateValue(children.name)}
                </div>
              )}

              {/* Sub children */}
              {showSubCategory.id === children._id && showSubCategory.show && (
                <ul className="pl-6 pb-3">
                  {children.children.map((subChildren) => (
                    <li
                      key={subChildren._id}
                      onClick={() =>
                        handleSearch(
                          subChildren._id,
                          showingTranslateValue(subChildren.name)
                        )
                      }
                      className="flex items-center py-1 text-sm text-gray-600 hover:text-primary-600 cursor-pointer"
                    >
                      <span className="text-xs text-gray-500 pr-2">
                        <IoRemoveSharp />
                      </span>
                      {showingTranslateValue(subChildren.name)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default CategoryCard;

