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
        // Priority: stored taxableRate, otherwise calculate from gross
        // Markup Logic: Taxable = Gross / (1 + Tax/100)
        const taxPercent = parseFloat(product.taxPercent) || 0;
        let taxableRate = tier.taxableRate || (tierPricePerUnit / (1 + taxPercent / 100));

        activeTier = {
          quantity: tierQuantity,
          pricePerUnit: tierPricePerUnit,
          taxableRate: parseFloat(taxableRate.toFixed(2)),
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

  const taxPercent = parseFloat(product.taxPercent) || 0;

  // 1. Try to get from active bulk tier first (highest priority)
  const activeTier = getActiveBulkTier(product, quantity, isPromoTime);
  if (activeTier && activeTier.taxableRate > 0) {
    return activeTier.taxableRate;
  }

  // 2. Check for promo single unit pricing during promo time
  if (isPromoTime && product.promoPricing?.singleUnit > 0) {
    if (product.promoPricing.singleUnitTaxable > 0) {
      return product.promoPricing.singleUnitTaxable;
    }
    // Markup Logic: Taxable = Gross / (1 + Tax%/100)
    return product.promoPricing.singleUnit / (1 + taxPercent / 100);
  }

  // 3. Fallback to product-level taxableRate
  if (product.taxableRate > 0) {
    return product.taxableRate;
  }

  // 4. Calculate from base gross price
  const basePrice = product.prices?.price || product.price || 0;
  return basePrice / (1 + taxPercent / 100);
};

