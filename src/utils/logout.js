/**
 * Centralized logout utility
 * Clears all user data, cookies, cart, and session
 */
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";

export const handleLogout = async (options = {}) => {
  const { 
    redirectUrl = "/",
    clearCart = true,
    clearCookies = true,
    signOutNextAuth = true,
    redirect = true
  } = options;

  try {
    // Clear all cookies
    if (clearCookies) {
      Cookies.remove("userInfo", { path: "/" });
      Cookies.remove("couponInfo", { path: "/" });
      Cookies.remove("shippingAddress", { path: "/" });
      Cookies.remove("_userInfo", { path: "/" });
      // Clear any other auth-related cookies
      const allCookies = Cookies.get();
      Object.keys(allCookies).forEach((cookieName) => {
        if (cookieName.includes("user") || cookieName.includes("auth") || cookieName.includes("session")) {
          Cookies.remove(cookieName, { path: "/" });
        }
      });
    }

    // Clear cart from localStorage (react-use-cart stores cart in localStorage)
    if (clearCart && typeof window !== "undefined") {
      try {
        // react-use-cart uses localStorage key "react-use-cart"
        localStorage.removeItem("react-use-cart");
        // Also clear any other cart-related localStorage items
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("cart") || key.includes("Cart")) {
            localStorage.removeItem(key);
          }
        });
      } catch (err) {
        console.error("Error clearing cart:", err);
      }
    }

    // Clear session storage
    if (typeof window !== "undefined") {
      try {
        sessionStorage.clear();
      } catch (err) {
        console.error("Error clearing sessionStorage:", err);
      }
    }

    // Sign out from NextAuth
    if (signOutNextAuth) {
      if (redirect) {
        await signOut({ callbackUrl: redirectUrl });
      } else {
        signOut({ redirect: false });
      }
    }

    // If redirect is needed but NextAuth signOut wasn't called, do manual redirect
    if (redirect && !signOutNextAuth && typeof window !== "undefined") {
      window.location.href = redirectUrl;
    }
  } catch (error) {
    console.error("Error during logout:", error);
    // Even if there's an error, try to redirect
    if (redirect && typeof window !== "undefined") {
      window.location.href = redirectUrl;
    }
  }
};


