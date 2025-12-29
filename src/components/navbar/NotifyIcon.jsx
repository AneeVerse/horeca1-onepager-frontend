"use client";

import { BellIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { useCart } from "react-use-cart";
import Image from "next/image";

// Internal imports
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";

const NotifyIcon = ({ currency, mobileOnly = false }) => {
  const { items } = useCart();
  const { cartDrawerOpen, setCartDrawerOpen } = React.useContext(SidebarContext);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevItemsLengthRef = React.useRef(0);
  let [mounted, setMounted] = useState(false);

  // Track number of different product types
  const uniqueProductsCount = items?.length || 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Pop animation when items are added
  useEffect(() => {
    if (uniqueProductsCount > prevItemsLengthRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 400);
      return () => clearTimeout(timer);
    }
    prevItemsLengthRef.current = uniqueProductsCount;
  }, [uniqueProductsCount]);

  return (
    <>
      <CartDrawer
        currency={currency}
        open={cartDrawerOpen}
        setOpen={setCartDrawerOpen}
      />
      <button
        type="button"
        aria-label={isHydrated ? `Cart with ${uniqueProductsCount} items` : "Cart"}
        onClick={() => setCartDrawerOpen(!cartDrawerOpen)}
        className={`relative flex-shrink-0 rounded-full ${mobileOnly ? 'p-1' : 'text-gray-200 p-1 mx-2 hover:text-white'} focus:outline-none transition-transform duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}
      >
        {isHydrated && uniqueProductsCount > 0 && (
          <span className={`absolute z-10 ${mobileOnly ? 'top-0 right-0' : 'top-0 -right-4'} inline-flex items-center justify-center p-1 h-5 w-5 text-xs font-medium leading-none text-red-100 transform ${mobileOnly ? '' : '-translate-x-1/2 -translate-y-1/2'} bg-red-500 rounded-full`}>
            {uniqueProductsCount}
          </span>
        )}
        <Image
          src="/CartWhiteIcon.png"
          alt="Cart"
          width={24}
          height={24}
          className="drop-shadow-lg object-contain"
        />
      </button>
      {/* Notification icon - Commented out as requested (can be restored later) */}
      {/* <button
        type="button"
        aria-label="Notification"
        className="relative flex-shrink-0 rounded-full text-gray-200 p-1 mx-2 hover:text-white focus:outline-none"
      >
        <BellIcon className="h-6 w-6" aria-hidden="true" />
      </button> */}

      {!mobileOnly && <span className="mx-4 h-6 w-px bg-gray-200 lg:mx-6" aria-hidden="true" />}
    </>
  );
};

export default NotifyIcon;
