"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "react-use-cart";
import { Home, ShoppingBag, User } from "lucide-react";
import Cookies from "js-cookie";

//internal imports
import PagesDrawer from "@components/drawer/PagesDrawer";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";

const MobileFooter = ({ globalSetting, categories, categoryError }) => {
  const [openPageDrawer, setOpenPageDrawer] = useState(false);
  const { cartDrawerOpen, setCartDrawerOpen } = React.useContext(SidebarContext);
  const { totalItems } = useCart();
  
  // Get userInfo from cookie (supports OTP users who may not have email/name)
  const [userInfo, setUserInfo] = useState(null);
  
  useEffect(() => {
    const userInfoCookie = Cookies.get("userInfo");
    if (userInfoCookie) {
      try {
        setUserInfo(JSON.parse(userInfoCookie));
      } catch {
        setUserInfo(null);
      }
    }
  }, []);

  // Check if user is logged in
  const isLoggedIn = !!(userInfo?.email || userInfo?.phone || userInfo?.token);

  const currency = globalSetting?.default_currency || "$";

  return (
    <>
      <CartDrawer
        currency={currency}
        open={cartDrawerOpen}
        setOpen={setCartDrawerOpen}
      />

      <div className="flex flex-col h-full justify-between align-middle bg-white rounded cursor-pointer overflow-y-scroll flex-grow scrollbar-hide w-full">
        <PagesDrawer
          open={openPageDrawer}
          setOpen={setOpenPageDrawer}
          categories={categories}
          categoryError={categoryError}
        />
      </div>
      <footer className="sm:hidden fixed z-30 bottom-0 bg-emerald-500 flex items-center justify-around w-full h-16 px-2 shadow-lg">
        {/* Home - First */}
        <Link
          href="/"
          className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none group"
          rel="noreferrer"
          aria-label="Home"
        >
          <Home className="w-6 h-6 text-white drop-shadow-lg transition-transform duration-200 group-active:scale-110" strokeWidth={2.5} />
          <span className="text-[10px] text-white mt-0.5 font-medium">Home</span>
        </Link>

        {/* Cart - Second */}
        <button
          onClick={() => setCartDrawerOpen(!cartDrawerOpen)}
          className="flex flex-col items-center justify-center flex-1 h-full relative whitespace-nowrap focus:outline-none group"
          aria-label="Shopping Cart"
        >
          <span className="absolute z-10 -top-1 right-1/4 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full shadow-md">
            {totalItems > 0 ? totalItems : ''}
          </span>
          <ShoppingBag className="w-6 h-6 text-white drop-shadow-lg transition-transform duration-200 group-active:scale-110" strokeWidth={2.5} />
          <span className="text-[10px] text-white mt-0.5 font-medium">Cart</span>
        </button>

        {/* Categories - Third */}
        <button
          aria-label="Categories"
          onClick={() => setOpenPageDrawer(true)}
          className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none group"
        >
          <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200 group-active:scale-110">
            <Image
              src="/category.svg"
              alt="Categories"
              width={24}
              height={24}
              className="brightness-0 invert drop-shadow-lg"
            />
          </div>
          <span className="text-[10px] text-white mt-0.5 font-medium">Categories</span>
        </button>

        {/* User - Fourth */}
        <button
          aria-label="User"
          type="button"
          className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none group"
        >
          {isLoggedIn ? (
            userInfo?.image ? (
              <Link href="/user/dashboard" aria-label="user" className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-6 h-6 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
                  <Image
                    width={24}
                    height={24}
                    src={userInfo.image}
                    alt="user"
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-white mt-0.5 font-medium">Account</span>
              </Link>
            ) : (
              <Link
                aria-label="User"
                href="/user/dashboard"
                className="flex flex-col items-center justify-center w-full h-full"
              >
                <div className="leading-none font-bold h-6 w-6 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-md text-xs border-2 border-white">
                  {userInfo?.name?.[0] || userInfo?.phone?.slice(-2) || "U"}
                </div>
                <span className="text-[10px] text-white mt-0.5 font-medium">Account</span>
              </Link>
            )
          ) : (
            <Link aria-label="user" href="/auth/otp-login" className="flex flex-col items-center justify-center w-full h-full">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-white">
                <User className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] text-white mt-0.5 font-medium">Account</span>
            </Link>
          )}
        </button>
      </footer>
    </>
  );
};

export default dynamic(() => Promise.resolve(MobileFooter), { ssr: false });
