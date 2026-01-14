"use client";

import { useRouter } from "next/navigation";
import { useCart } from "react-use-cart";
import { IoBagCheckOutline, IoClose, IoBagHandle } from "react-icons/io5";
import { useState, useEffect, useMemo } from "react";

//internal import
import CartItem from "@components/cart/CartItem";
import { getUserSession } from "@lib/auth-client";
import { FiShoppingCart } from "react-icons/fi";
import Image from "next/image";
import useCartPriceSync from "@hooks/useCartPriceSync";

const Cart = ({ setOpen, currency }) => {
  const router = useRouter();
  const { isEmpty, items, cartTotal } = useCart();

  // Sync cart prices when promo time changes
  useCartPriceSync();

  // Use state to reactively track user session
  const [userInfo, setUserInfo] = useState(null);

  // Check user session on mount and periodically to catch login state changes
  useEffect(() => {
    const checkUserSession = () => {
      const session = getUserSession();
      setUserInfo(session);
    };

    // Check immediately
    checkUserSession();

    // Also check periodically to catch login state changes (every 1 second)
    const interval = setInterval(checkUserSession, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate pricing breakdown
  const pricingBreakdown = useMemo(() => {
    const standardDeliveryCharge = 30;
    const isFreeDelivery = true; // Always free delivery
    const actualDeliveryCharge = 0; // Always free

    // Calculate GST component (Informative)
    let totalGst = 0;
    items.forEach(item => {
      const taxPercent = parseFloat(item.taxPercent) || 0;
      const quantity = item.quantity || 1;
      const grossPrice = parseFloat(item.price) || 0;
      const totalGross = grossPrice * quantity;

      const taxable = totalGross / (1 + taxPercent / 100);
      const gst = totalGross - taxable;
      totalGst += gst;
    });

    // Calculate Original Total Component
    let originalTotalGross = 0;
    items.forEach(item => {
      const quantity = item.quantity || 1;
      let itemOriginalPriceGross = parseFloat(item.originalPrice || item.prices?.originalPrice || item.prices?.price || 0);
      const itemCurrentPriceGross = parseFloat(item.price) || 0;

      // Safety net for bulk pricing
      if (itemOriginalPriceGross <= itemCurrentPriceGross && item.bulkPricing?.bulkRate1?.pricePerUnit > 0) {
        const possibleBase = parseFloat(item.prices?.price || item.prices?.originalPrice || 0);
        if (possibleBase > itemCurrentPriceGross) {
          itemOriginalPriceGross = possibleBase;
        }
      }
      if (itemOriginalPriceGross === 0) itemOriginalPriceGross = itemCurrentPriceGross;
      originalTotalGross += itemOriginalPriceGross * quantity;
    });

    return {
      deliveryCharge: actualDeliveryCharge,
      standardDeliveryCharge,
      isFreeDelivery,
      itemTotalOriginal: originalTotalGross,
      taxableSubtotal: cartTotal - totalGst,
      totalGst: totalGst,
      total: cartTotal + actualDeliveryCharge,
    };
  }, [items, cartTotal]);


  // Check if any items are below their minimum order quantity
  const itemsBelowMinimum = useMemo(() => {
    return items.filter(item => item.minOrderQuantity > 1 && item.quantity < item.minOrderQuantity);
  }, [items]);

  const hasMinimumQuantityError = itemsBelowMinimum.length > 0;

  const handleCheckout = (e) => {
    e.preventDefault();

    if (hasMinimumQuantityError) {
      return;
    }

    if (items?.length <= 0) {
      setOpen(false);
    } else {
      // Always go to checkout - guests will verify OTP inline on checkout page
      router.push("/checkout");
      setOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full justify-between items-middle bg-white rounded w-screen max-w-lg">
        <div className="w-full flex justify-between items-center relative px-5 py-4 border-b bg-indigo-50 border-gray-100">
          <h2 className="font-semibold  text-lg m-0 text-heading flex items-center">
            <FiShoppingCart
              aria-hidden="true"
              className="size-6 shrink-0 me-2"
            />
            Shopping Cart
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="inline-flex text-base items-center cursor-pointer justify-center text-gray-500 p-2 focus:outline-none transition-opacity hover:text-red-400"
          >
            <IoClose />
            <span className="font-sens text-sm text-gray-500 hover:text-red-400 ml-1">
              Close
            </span>
          </button>
        </div>
        <div className="overflow-y-scroll flex-grow scrollbar-hide w-full max-h-full p-4 lg:p-6 pb-0">
          {isEmpty && (
            <div className="flex flex-col h-full justify-center">
              <div className="flex flex-col items-center">
                <Image
                  className="size-40 flex-none rounded-md object-cover"
                  src="/no-result.svg"
                  alt="no-result"
                  width={400}
                  height={380}
                />
                <h3 className=" font-semibold text-gray-700 text-lg pt-5">
                  Your cart is empty
                </h3>
                <p className="px-12 text-center text-sm text-gray-500 pt-2">
                  No items added in your cart. Please add product to your cart
                  list.
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/search");
                  }}
                  className="mt-6 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
                >
                  Shop Now
                </button>
              </div>
            </div>
          )}

          {items.map((item, i) => (
            <CartItem key={`${item.id}-${i}`} item={item} currency={currency} />
          ))}
        </div>

        {/* Footer with checkout button */}
        {!isEmpty && (
          <div className="bg-neutral-50 dark:bg-slate-900 p-5 pt-4 pb-20 sm:pb-5 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {hasMinimumQuantityError && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Some items don't meet minimum quantity
                  </p>
                  <p className="text-[10px] text-red-500 mt-0.5">Please update quantities before checkout.</p>
                </div>
              )}
              <button
                onClick={handleCheckout}
                disabled={hasMinimumQuantityError}
                className={`relative h-12 w-full inline-flex items-center justify-center rounded-lg transition-all text-sm sm:text-base font-bold py-2 px-3 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${hasMinimumQuantityError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#018549] hover:bg-[#016d3b] text-white focus:ring-[#018549]"
                  }`}
              >
                Checkout
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
