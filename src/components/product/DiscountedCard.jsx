"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { IoAdd, IoExpand, IoBagAdd, IoRemove } from "react-icons/io5";
import { useCart } from "react-use-cart";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

//internal import

import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import { handleLogEvent } from "src/lib/analytics";
import Discount from "@components/common/Discount";
import PriceTwo from "@components/common/PriceTwo";
import Rating from "@components/common/Rating";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const DiscountedCard = ({ product, attributes, currency }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { items, addItem, updateItemQuantity, removeItem, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { showingTranslateValue } = useUtilsFunction();
  const router = useRouter();
  const pathname = usePathname();

  // console.log('attributes in product cart',attributes)

  const handleAddItem = (p) => {
    // Always open quick view modal when clicking any Add button
    setModalOpen(true);
    return;
  };

  const handleModalOpen = (event, id) => {
    setModalOpen(event);
  };

  return (
    <>
      {modalOpen && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          attributes={attributes}
        />
      )}

      <div className="group relative flex flex-col overflow-hidden rounded-sm min-[300px]:rounded-md min-[345px]:rounded-lg sm:rounded-xl border bg-white border-gray-100 transition-all duration-100 ease-in-out hover:border-[#018549] ">
        <div className="w-full flex justify-between">
          <Discount product={product} />
        </div>
        <div className="relative w-full h-24 min-[300px]:h-28 min-[345px]:h-36 sm:h-48 lg:h-48 xl:h-52">
          <div className="relative block w-full h-full overflow-hidden bg-gray-100">
            <ImageWithFallback
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              alt="product"
              src={product.image?.[0]}
            />
          </div>
          <div className="absolute lg:bottom-0 bottom-2 min-[345px]:bottom-4 lg:group-hover:bottom-4 inset-x-1 opacity-100 flex justify-center lg:opacity-0 lg:invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button
              aria-label="quick view"
              onClick={() => {
                handleModalOpen(!modalOpen, product._id);
                handleLogEvent(
                  "product",
                  `opened ${showingTranslateValue(
                    product?.title
                  )} product modal`
                );
              }}
              className="relative h-auto inline-flex items-center cursor-pointer justify-center rounded-full transition-colors text-[7px] min-[300px]:text-[8px] min-[345px]:text-[10px] sm:text-xs py-0.5 min-[345px]:py-1 sm:py-2 px-1 min-[300px]:px-1.5 min-[345px]:px-2 sm:px-4 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:text-[#018549] hover:bg-gray-100 dark:hover:bg-slate-800 shadow-lg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#018549] dark:focus:ring-offset-0"
            >
              <IoExpand className="w-2 h-2 min-[300px]:w-2.5 min-[300px]:h-2.5 min-[345px]:w-3 min-[345px]:h-3 sm:w-4 sm:h-4" />
              <span className="ms-1 hidden xl:block lg:block">Quick View</span>
            </button>
          </div>
          <div className="absolute bottom-1 min-[300px]:bottom-2 min-[345px]:bottom-3 right-1 min-[300px]:right-2 min-[345px]:right-3 z-10 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-100 hover:text-[#018549]">
            {inCart(product._id) ? (
              <div>
                {items.map(
                  (item) =>
                    item.id === product._id && (
                      <div
                        key={item.id}
                        className="flex flex-col w-7 min-[300px]:w-8 min-[345px]:w-9 sm:w-11 h-16 min-[300px]:h-18 min-[345px]:h-20 sm:h-22 items-center p-0.5 min-[300px]:p-1 justify-between bg-[#018549] text-white ring-1 min-[345px]:ring-2 ring-white rounded-full"
                      >
                        <button
                          onClick={() => {
                            const minQty = product?.minOrderQuantity || item?.minOrderQuantity || 1;
                            // If quantity is at or below minimum, remove item (go to 0)
                            if (item.quantity <= minQty) {
                              removeItem(item.id);
                            } else {
                              updateItemQuantity(item.id, item.quantity - 1);
                            }
                          }}
                        >
                          <span className="text-sm min-[300px]:text-base min-[345px]:text-lg sm:text-xl cursor-pointer">
                            <IoRemove />
                          </span>
                        </button>
                        <p className="text-[8px] min-[300px]:text-[9px] min-[345px]:text-xs sm:text-sm px-0.5 min-[345px]:px-1 font-medium">
                          {item.quantity}
                        </p>
                        <button
                          onClick={() =>
                            item?.variants?.length > 0
                              ? handleAddItem(item)
                              : handleIncreaseQuantity(item)
                          }
                        >
                          <span className="text-xs min-[300px]:text-sm min-[345px]:text-base sm:text-lg cursor-pointer">
                            <IoAdd />
                          </span>
                        </button>
                      </div>
                    )
                )}{" "}
              </div>
            ) : (
              <button
                onClick={() => handleAddItem(product)}
                aria-label="cart"
                className="w-7 h-7 min-[300px]:w-8 min-[300px]:h-8 min-[345px]:w-9 min-[345px]:h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full cursor-pointer border min-[345px]:border-2 bg-[#018549] text-white border-gray-10 font-medium transition-colors duration-300 hover:border-accent hover:bg-[#016d3b] hover:border-[#018549] hover:text-gray-50 focus:border-[#018549] focus:bg-[#018549] focus:text-gray-50"
              >
                {" "}
                <IoBagAdd className="text-sm min-[300px]:text-base min-[345px]:text-lg sm:text-xl" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col space-y-0.5 min-[300px]:space-y-1 min-[345px]:space-y-1.5 sm:space-y-2 px-1 min-[300px]:px-2 min-[345px]:px-3 sm:px-4 pt-0.5 min-[300px]:pt-1 min-[345px]:pt-1.5 sm:pt-2 pb-2 min-[300px]:pb-4 min-[345px]:pb-6 sm:pb-8">
          <div className="relative mb-0.5 min-[345px]:mb-1">
            <div className="text-[8px] min-[300px]:text-[9px] min-[345px]:text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 min-[345px]:line-clamp-1">
              {showingTranslateValue(product?.title)}
            </div>
          </div>
          <div className="flex gap-0.5 items-center">
            <Rating
              size="md"
              showReviews={true}
              rating={product?.average_rating}
              totalReviews={product?.total_reviews}
            />
          </div>

          <PriceTwo
            card
            product={product}
            currency={currency}
            price={
              product?.isCombination
                ? product?.variants[0]?.price
                : product?.prices?.price
            }
            originalPrice={
              product?.isCombination
                ? product?.variants[0]?.originalPrice
                : product?.prices?.originalPrice
            }
          />
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(DiscountedCard), {
  ssr: false,
});

