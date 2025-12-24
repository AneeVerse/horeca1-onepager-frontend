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

const OfferCard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full">
        <div className="bg-gray-100 h-full rounded-xl animate-pulse"></div>
      </div>
    );
  }

  // Always show PromoTimerCard - it handles both active and upcoming states internally
  return (
    <div className="w-full h-full">
      <PromoTimerCard />
    </div>
  );
};

export default OfferCard;
