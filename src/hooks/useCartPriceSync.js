"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useCart } from "react-use-cart";
import { getTaxableRate } from "@utils/pricing";

/**
 * Helper function to check if current time is promo time (6pm-9am)
 */
const checkIsPromoTime = () => {
    // Check for test hour override
    const testHour = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TEST_HOUR;
    let hours;
    if (testHour !== undefined && testHour !== '') {
        hours = parseInt(testHour, 10);
    } else {
        const now = new Date();
        hours = now.getHours();
    }
    return hours >= 18 || hours < 9;
};

/**
 * Helper function to calculate the correct price for an item based on promo time
 */
const getCorrectPriceForItem = (item, isPromoTime) => {
    const quantity = item.quantity || 1;
    // Use prices.price (Selling Price) as the primary base.
    // Fallback to item.price (current stored), then originalPrice.
    // We must NOT prioritize originalPrice because it is often the MRP (higher than selling price).
    const basePrice = item.prices?.price || item.price || item.originalPrice || 0;
    const promoSinglePrice = item.promoPricing?.singleUnit || 0;

    // Check promo pricing first if promo time
    if (isPromoTime && item?.promoPricing) {
        if (item.promoPricing?.bulkRate2?.quantity > 0 && quantity >= item.promoPricing.bulkRate2.quantity) {
            return item.promoPricing.bulkRate2.pricePerUnit;
        }
        if (item.promoPricing?.bulkRate1?.quantity > 0 && quantity >= item.promoPricing.bulkRate1.quantity) {
            return item.promoPricing.bulkRate1.pricePerUnit;
        }
        // Fall back to promo single unit price
        if (promoSinglePrice > 0) {
            return promoSinglePrice;
        }
        // If no promo pricing available, use base price
        return basePrice;
    }

    // Not promo time - use regular bulkPricing
    if (item?.bulkPricing?.bulkRate2?.quantity > 0 && quantity >= item.bulkPricing.bulkRate2.quantity) {
        return item.bulkPricing.bulkRate2.pricePerUnit;
    }
    if (item?.bulkPricing?.bulkRate1?.quantity > 0 && quantity >= item.bulkPricing.bulkRate1.quantity) {
        return item.bulkPricing.bulkRate1.pricePerUnit;
    }

    // Fall back to base price when quantity doesn't meet bulk requirements
    return basePrice;
};

/**
 * Custom hook to sync cart prices when promo time changes
 * This hook monitors promo time and updates all cart item prices accordingly
 */
const useCartPriceSync = () => {
    const { items, updateItem } = useCart();
    const [isPromoTime, setIsPromoTime] = useState(checkIsPromoTime());
    const lastSyncRef = useRef(0);
    const isUpdatingRef = useRef(false);

    // Function to update all cart prices based on current promo status
    const syncCartPrices = useCallback((currentIsPromoTime, force = false) => {
        if (isUpdatingRef.current || items.length === 0) return;

        // Prevent rapid re-syncing (debounce to 1 second)
        const now = Date.now();
        if (!force && now - lastSyncRef.current < 1000) return;
        lastSyncRef.current = now;

        isUpdatingRef.current = true;

        try {
            let updatedCount = 0;
            items.forEach((item) => {
                const correctPrice = getCorrectPriceForItem(item, currentIsPromoTime);
                const taxableRate = getTaxableRate(item, item.quantity, currentIsPromoTime);

                // Check if update is needed (with small tolerance for floating point)
                const priceNeedsUpdate = Math.abs(item.price - correctPrice) > 0.001;
                const taxableNeedsUpdate = Math.abs((item.taxableRate || 0) - taxableRate) > 0.001;

                if (priceNeedsUpdate || taxableNeedsUpdate) {
                    console.log(`Syncing cart item "${item.title}": ${item.price} -> ${correctPrice} (promo: ${currentIsPromoTime})`);
                    updateItem(item.id, {
                        price: correctPrice,
                        taxableRate: taxableRate
                    });
                    updatedCount++;
                }
            });

            if (updatedCount > 0) {
                console.log(`Cart price sync complete: ${updatedCount} items updated`);
            }
        } finally {
            isUpdatingRef.current = false;
        }
    }, [items, updateItem]);

    // Monitor promo time changes - check every 10 seconds
    useEffect(() => {
        const checkPromoTimeChange = () => {
            const currentIsPromoTime = checkIsPromoTime();
            setIsPromoTime(currentIsPromoTime);
        };

        // Check immediately on mount
        checkPromoTimeChange();

        // Set up interval to check every 10 seconds (more responsive)
        const intervalId = setInterval(checkPromoTimeChange, 10000);

        return () => clearInterval(intervalId);
    }, []);

    // Sync cart prices whenever isPromoTime changes OR when this hook mounts
    useEffect(() => {
        // Always sync on mount and when promo time changes
        syncCartPrices(isPromoTime, true);
    }, [isPromoTime, syncCartPrices]);

    // Also force sync when items array reference changes (new items added)
    useEffect(() => {
        if (items.length > 0) {
            // Small delay to ensure cart state is stable after item changes
            const timeoutId = setTimeout(() => {
                syncCartPrices(isPromoTime, false);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [items, isPromoTime, syncCartPrices]);

    return {
        isPromoTime,
        syncCartPrices: () => syncCartPrices(isPromoTime, true),
    };
};

export default useCartPriceSync;
