"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { Tag, Clock, Gift } from "lucide-react";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { baseURL } from "@services/CommonService";

// Countdown Timer Component for Sale Start
const SaleCountdownTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Calculate time until 6pm (18:00)
      let remainingHours, remainingMinutes, remainingSeconds;

      if (hours < 18) {
        // Before 6pm, calculate time until 6pm today
        remainingHours = 17 - hours;
        remainingMinutes = 59 - minutes;
        remainingSeconds = 60 - seconds;
      } else {
        // After 6pm, calculate time until 6pm next day
        remainingHours = (24 - hours - 1) + 18;
        remainingMinutes = 59 - minutes;
        remainingSeconds = 60 - seconds;
      }

      if (remainingSeconds === 60) {
        remainingSeconds = 0;
        remainingMinutes += 1;
      }
      if (remainingMinutes === 60) {
        remainingMinutes = 0;
        remainingHours += 1;
      }

      setTimeRemaining({
        hours: Math.max(0, remainingHours),
        minutes: Math.max(0, remainingMinutes),
        seconds: Math.max(0, remainingSeconds),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs mb-2">
      <Clock className="w-3 h-3 text-orange-500" />
      <span className="text-gray-600 font-medium">Sale starts in:</span>
      <div className="flex items-center gap-1">
        <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold text-xs">
          {timeRemaining.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-500">:</span>
        <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold text-xs">
          {timeRemaining.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-500">:</span>
        <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold text-xs">
          {timeRemaining.seconds.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

const CouponSection = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("₹");
  const { showingTranslateValue } = useUtilsFunction();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch coupons
        const couponRes = await fetch(`${baseURL}/coupon/show`);
        const couponData = await couponRes.json();
        setCoupons(couponData || []);

        // Fetch settings
        const settingRes = await fetch(`${baseURL}/setting/global/all`);
        const settingData = await settingRes.json();
        setCurrency(settingData?.default_currency || "₹");
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full">
        <div className="bg-gray-50 h-full border-2 border-orange-500 rounded-lg shadow animate-pulse">
          <div className="bg-orange-100 px-6 py-3 rounded-t border-b">
            <div className="h-5 bg-orange-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-md p-4 h-24"></div>
            <div className="bg-white rounded-md p-4 h-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-gray-50 h-full border-2 border-orange-500 transition duration-150 ease-linear hover:border-[#018549] rounded-xl shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-3 border-b border-orange-200">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-semibold text-gray-800">
              Active Discount Coupons
            </h3>
          </div>
        </div>

        {/* Coupons List */}
        <div className="p-3 space-y-3 overflow-y-auto max-h-[320px]">
          {coupons?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No active coupons available</p>
            </div>
          ) : (
            coupons?.slice(0, 2).map((coupon) => {
              const isExpired = dayjs().isAfter(dayjs(coupon.endTime));
              
              return (
                <div
                  key={coupon._id}
                  className={`bg-white rounded-lg shadow-sm border ${
                    isExpired ? "border-gray-200 opacity-60" : "border-emerald-100"
                  } overflow-hidden`}
                >
                  <div className="flex items-start gap-3 p-3">
                    {/* Coupon Logo */}
                    {coupon.logo && (
                      <div className="flex-shrink-0">
                        <Image
                          src={coupon.logo}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                          alt={showingTranslateValue(coupon.title) || "Coupon"}
                        />
                      </div>
                    )}

                    {/* Coupon Details */}
                    <div className="flex-1 min-w-0">
                      {/* Promotional Timing */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-orange-600">
                          Sale: 6pm - 9am
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isExpired
                              ? "bg-red-100 text-red-600"
                              : "bg-emerald-100 text-[#018549]"
                          }`}
                        >
                          {isExpired ? "Expired" : "Upcoming"}
                        </span>
                      </div>

                      <h4 className="text-sm font-medium text-gray-800 truncate mb-2">
                        {showingTranslateValue(coupon?.title)}
                      </h4>

                      {/* Countdown Timer to Next Sale Start */}
                      <SaleCountdownTimer />

                      {/* Coupon Code */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-emerald-50 border border-dashed border-emerald-300 rounded px-2 py-1">
                          <code className="text-sm font-semibold text-[#016d3b]">
                            {coupon.couponCode}
                          </code>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.couponCode);
                          }}
                          className="text-xs px-2 py-1 bg-[#018549] text-white rounded hover:bg-[#016d3b] transition-colors"
                        >
                          Copy
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Min. order: {currency}{coupon.minimumAmount}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponSection;







