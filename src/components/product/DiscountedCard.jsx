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
  const [isPromoTime, setIsPromoTime] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { checkIsPromoTime } = require("@utils/date");

  // Check if current time is promo time (6pm-9am IST)
  useEffect(() => {
    const updatePromoTime = () => {
      setIsPromoTime(checkIsPromoTime());
    };
    updatePromoTime();
    const interval = setInterval(updatePromoTime, 30000);
    return () => clearInterval(interval);
  }, []);

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

      <div className="group relative flex flex-col overflow-hidden rounded-sm min-[300px]:rounded-md min-[345px]:rounded-lg sm:rounded-xl border bg-white border-gray-100 transition-all duration-100 ease-in-out hover:border-[#018549] w-full h-full">
        <div className="w-full flex justify-between">
          <Discount product={product} />
        </div>
        <div className="relative w-full aspect-[4/3.5] min-[300px]:aspect-[4/3] min-[345px]:aspect-[4/3] sm:aspect-square">
          <div
            className="relative block w-full h-full overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => {
              handleModalOpen(!modalOpen, product._id);
              handleLogEvent(
                "product",
                `opened ${showingTranslateValue(product?.title)} product modal via image click`
              );
            }}
          >
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
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col px-1 min-[300px]:px-1.5 min-[345px]:px-2 sm:px-3 pt-0.5 min-[300px]:pt-1 min-[345px]:pt-1.5 sm:pt-2 pb-1 min-[300px]:pb-1.5 min-[345px]:pb-2 sm:pb-3">
          {/* Product Title */}
          <div className="h-6 min-[300px]:h-7 min-[345px]:h-10 sm:h-12 text-[8px] min-[300px]:text-[9px] min-[345px]:text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-tight min-[345px]:leading-tight sm:leading-snug mb-0.5">
            {showingTranslateValue(product?.title)}
          </div>

          {/* Rating */}
          <div className="flex gap-0.5 items-center mb-0.5 min-[345px]:mb-1">
            <Rating
              size="md"
              showReviews={true}
              rating={product?.average_rating}
              totalReviews={product?.total_reviews}
            />
          </div>

          {/* Price Section */}
          <div className="flex flex-col mt-auto pt-0.5 min-[345px]:pt-1 sm:pt-1.5">
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
            {/* Promo Bulk Pricing Display (6pm-9am) - Unified Happy Hour Design */}
            {isPromoTime && product?.promoPricing && (product?.promoPricing?.bulkRate1?.quantity > 0 || product?.promoPricing?.bulkRate2?.quantity > 0) && (
              <div className="bg-gradient-to-br from-[#881337] via-[#9d174d] to-[#be123c] rounded-sm min-[300px]:rounded-md p-1.5 min-[300px]:p-2 mb-1.5 min-[300px]:mb-2 space-y-1.5 border border-white/10 shadow-lg relative overflow-hidden group">
                {/* Subtle Decorative Glow */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-8 -mt-8"></div>

                {product?.promoPricing?.bulkRate1?.quantity > 0 && product?.promoPricing?.bulkRate1?.pricePerUnit > 0 && (
                  <div className="relative z-10 flex items-center justify-between gap-1">
                    <span className="text-[7px] min-[300px]:text-[8px] min-[345px]:text-[10px] sm:text-xs text-rose-50 font-medium leading-tight flex-1">
                      <span className="hidden min-[345px]:inline">{currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"} for {product.promoPricing.bulkRate1.quantity}+</span>
                      <span className="min-[345px]:hidden">{currency}{product.promoPricing.bulkRate1.pricePerUnit}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddItem(product); // In DiscountedCard, all Add buttons currently open the modal
                      }}
                      className="text-[7px] min-[300px]:text-[8px] font-bold text-white bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded border border-white/10 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      +{product.promoPricing.bulkRate1.quantity}
                    </button>
                  </div>
                )}
                {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                  <div className="relative z-10 flex items-center justify-between gap-1">
                    <span className="text-[7px] min-[300px]:text-[8px] min-[345px]:text-[10px] sm:text-xs text-rose-50 font-medium leading-tight flex-1">
                      <span className="hidden min-[345px]:inline">{currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"} for {product.promoPricing.bulkRate2.quantity}+</span>
                      <span className="min-[345px]:hidden">{currency}{product.promoPricing.bulkRate2.pricePerUnit}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddItem(product);
                      }}
                      className="text-[7px] min-[300px]:text-[8px] font-bold text-white bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded border border-white/10 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      +{product.promoPricing.bulkRate2.quantity}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Full Width Add Button */}
          <div className="w-full mt-1 min-[300px]:mt-1.5 min-[345px]:mt-2 sm:mt-2.5">
            {inCart(product._id) ? (
              <>
                {items.map(
                  (item) =>
                    item.id === product._id && (
                      <div
                        key={item.id}
                        className={`flex items-center justify-center h-6 min-[300px]:h-7 min-[345px]:h-8 sm:h-9 rounded-md overflow-hidden shadow-sm w-full ${isPromoTime
                          ? "bg-[#ffe4e6] border border-[#fda4af]"
                          : "bg-[#d1fae5] border border-[#5ee9b5]"
                          }`}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const minQty = product?.minOrderQuantity || item?.minOrderQuantity || 1;
                            if (item.quantity <= minQty) {
                              removeItem(item.id);
                            } else {
                              updateItemQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          className={`w-8 min-[300px]:w-9 min-[345px]:w-10 sm:w-12 h-full flex items-center justify-center transition-colors border-r ${isPromoTime
                            ? "hover:bg-[#fecdd3] border-[#fda4af]/30"
                            : "hover:bg-[#b9f6e1] border-[#5ee9b5]/30"
                            }`}
                          style={{ color: isPromoTime ? "#be123c" : "#065f46" }}
                        >
                          <IoRemove size={12} className="min-[300px]:size-[14px] min-[345px]:size-[16px] sm:size-[18px] stroke-2" />
                        </button>

                        <div className={`flex-1 h-full flex items-center justify-center bg-white border-x ${isPromoTime ? "border-[#fda4af]/20" : "border-[#5ee9b5]/20"
                          }`}>
                          <span className={`text-[10px] min-[300px]:text-xs min-[345px]:text-sm sm:text-base font-bold ${isPromoTime ? "text-[#be123c]" : "text-[#065f46]"
                            }`}>
                            {item.quantity}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            item?.variants?.length > 0
                              ? handleAddItem(item)
                              : handleIncreaseQuantity(item);
                          }}
                          className={`w-8 min-[300px]:w-9 min-[345px]:w-10 sm:w-12 h-full flex items-center justify-center transition-colors border-l ${isPromoTime
                            ? "hover:bg-[#fecdd3] border-[#fda4af]/30"
                            : "hover:bg-[#b9f6e1] border-[#5ee9b5]/30"
                            }`}
                          style={{ color: isPromoTime ? "#be123c" : "#065f46" }}
                        >
                          <IoAdd size={12} className="min-[300px]:size-[14px] min-[345px]:size-[16px] sm:size-[18px] stroke-2" />
                        </button>
                      </div>
                    )
                )}
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddItem(product);
                }}
                className={`w-full flex items-center justify-center gap-1 min-[300px]:gap-1.5 py-1 min-[300px]:py-1.5 min-[345px]:py-2 sm:py-2.5 rounded-md transition-all hover:shadow-md ${isPromoTime
                  ? "bg-[#ffe4e6] border border-[#fda4af] hover:bg-[#fecdd3]"
                  : "bg-[#d1fae5] border border-[#5ee9b5] hover:bg-[#b9f6e1]"
                  }`}
              >
                <span className={`text-[9px] min-[300px]:text-[10px] min-[345px]:text-xs sm:text-sm font-bold tracking-wide ${isPromoTime ? "text-[#be123c]" : "text-[#065f46]"}`}>
                  Add
                </span>
                <IoAdd
                  size={12}
                  className={`min-[300px]:size-[14px] min-[345px]:size-[16px] sm:size-[18px] ${isPromoTime ? "text-[#be123c]" : "text-[#065f46]"}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(DiscountedCard), {
  ssr: false,
});

