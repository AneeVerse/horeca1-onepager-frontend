/**
 * Get the active bulk tier for a product based on quantity and promo time
 * @param {Object} product - Product object with bulkPricing and promoPricing
 * @param {Number} quantity - Current quantity
 * @param {Boolean} isPromoTime - Whether current time is promo time (6pm-9am)
 * @returns {Object|null} - Active bulk tier object with taxableRate, pricePerUnit, quantity, or null
 */
export const getActiveBulkTier = (product, quantity, isPromoTime = false) => {
  if (!product || !quantity || quantity <= 0) {
    return null;
  }

  // Determine which pricing structure to use
  const pricing = isPromoTime ? product.promoPricing : product.bulkPricing;
  const regularPricing = product.bulkPricing;

  if (!pricing) {
    return null;
  }

  // Check bulk tiers in reverse order (highest quantity first)
  // Find the highest tier that matches the quantity
  let activeTier = null;
  let highestQuantity = 0;

  // Check all bulk rates (bulkRate1, bulkRate2, etc.)
  let rateIndex = 1;
  while (pricing[`bulkRate${rateIndex}`] || regularPricing?.[`bulkRate${rateIndex}`]) {
    const tier = pricing[`bulkRate${rateIndex}`] || {};
    const regularTier = regularPricing?.[`bulkRate${rateIndex}`] || {};

    // Check if this tier applies
    const tierQuantity = tier.quantity || 0;
    const tierPricePerUnit = tier.pricePerUnit || 0;

    if (tierQuantity > 0 && quantity >= tierQuantity && tierQuantity > highestQuantity) {
      if (tierPricePerUnit > 0) {
        highestQuantity = tierQuantity;
        // GST-exclusive: Taxable rate = Price itself
        let taxableRate = tier.taxableRate || tierPricePerUnit;
        
        activeTier = {
          quantity: tierQuantity,
          pricePerUnit: tierPricePerUnit,
          taxableRate: taxableRate,
          tierIndex: rateIndex,
        };
      }
    }

    rateIndex++;
  }

  return activeTier;
};

/**
 * Get the taxable rate for a product based on active bulk tier
 * @param {Object} product - Product object
 * @param {Number} quantity - Current quantity
 * @param {Boolean} isPromoTime - Whether current time is promo time
 * @returns {Number} - Taxable rate per unit
 */
export const getTaxableRate = (product, quantity, isPromoTime = false) => {
  if (!product) {
    return 0;
  }

  // Try to get from active bulk tier
  const activeTier = getActiveBulkTier(product, quantity, isPromoTime);
  if (activeTier && activeTier.taxableRate > 0) {
    return activeTier.taxableRate;
  }

  // Fallback to product-level taxableRate
  if (product.taxableRate > 0) {
    return product.taxableRate;
  }

  // Get base price - use promo single unit during promo time if available, otherwise regular price
  let basePrice = product.prices?.price || product.price || 0;
  if (isPromoTime && product.promoPricing?.singleUnit > 0) {
    basePrice = product.promoPricing.singleUnit;
  }
  
  // GST-exclusive: Taxable rate = Price itself (but we need to calculate Taxable = Gross - GST)
  // Since we don't have GST here, we'll use the stored taxableRate or calculate from base price
  // For now, return base price as taxable rate (will be recalculated elsewhere if needed)
  return basePrice;
};

