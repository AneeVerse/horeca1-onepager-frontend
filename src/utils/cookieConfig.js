/**
 * Cookie Configuration Utility
 * Provides consistent cookie settings following best practices
 */

/**
 * Get cookie options with best practices
 * @param {number} expiresInDays - Number of days until expiration (default: 30)
 * @returns {object} Cookie options object
 */
export const getCookieOptions = (expiresInDays = 30) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isHTTPS = typeof window !== "undefined" && window.location.protocol === "https:";
  
  return {
    expires: expiresInDays, // Expiration in days
    path: "/", // Available site-wide
    sameSite: "lax", // CSRF protection, allows same-site requests
    // Secure flag: Only send cookies over HTTPS (in production or if already on HTTPS)
    secure: isProduction || isHTTPS, // Set secure flag in production or when on HTTPS
  };
};

/**
 * Cookie options for different use cases
 */
export const cookieConfig = {
  // User authentication cookie (30 days)
  userInfo: getCookieOptions(30),
  
  // Coupon cookie (7 days - shorter for discounts)
  couponInfo: getCookieOptions(7),
  
  // Shipping address cookie (30 days)
  shippingAddress: getCookieOptions(30),
  
  // Language preference cookie (365 days - long-term preference)
  language: getCookieOptions(365),
};


