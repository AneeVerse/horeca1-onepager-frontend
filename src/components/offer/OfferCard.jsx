"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import PromoTimerCard (client component)
const PromoTimerCard = dynamic(() => import("@components/promo/PromoTimerCard"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl"></div>
  ),
});

// Dynamically import CouponSection (will create)
const CouponSection = dynamic(() => import("@components/coupon/CouponSection"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl"></div>
  ),
});

const OfferCard = () => {
  const [isPromoTime, setIsPromoTime] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkPromoTime = () => {
      const now = new Date();
      const hours = now.getHours();
      // 6pm (18:00) to midnight (23:59) or midnight (00:00) to 9am (08:59)
      setIsPromoTime(hours >= 18 || hours < 9);
    };
    checkPromoTime();
    const interval = setInterval(checkPromoTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full">
        <div className="bg-gray-100 h-full rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {isPromoTime ? <PromoTimerCard /> : <CouponSection />}
    </div>
  );
};

export default OfferCard;
