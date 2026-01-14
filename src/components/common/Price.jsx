import useUtilsFunction from "@hooks/useUtilsFunction";

const Price = ({ product, price, card, originalPrice, currency, showUnit = false, isPromoTime = false }) => {
  const { getNumberTwo } = useUtilsFunction();

  // From "second design" logic
  const isCombo = product?.isCombination;
  const finalPrice = isCombo
    ? getNumberTwo(price)
    : getNumberTwo(product?.prices?.price);
  const baseOriginalPrice = getNumberTwo(originalPrice);
  const discountAmount = originalPrice > price ? originalPrice - price : 0;
  const discountPercent =
    originalPrice > price
      ? ((discountAmount / originalPrice) * 100).toFixed(2)
      : 0;

  // Get unit from product
  const unit = product?.unit || "";

  return (
    <>
      <div className="product-price font-bold">
        <span
          className={`${card
              ? `inline-block text-base ${isPromoTime ? 'text-[#be123c]' : 'text-gray-900'}`
              : `inline-block text-xl ${isPromoTime ? 'text-[#be123c]' : 'text-gray-900'}`
            }`}
        >
          {currency}
          {finalPrice}
          {showUnit && unit && (
            <span className={`text-sm font-normal ${isPromoTime ? 'text-[#fda4af]' : 'text-gray-500'}`}>
              /{unit}
            </span>
          )}
        </span>
        {discountAmount > 0 && (
          <span
            className={`${card
                ? `sm:text-sm font-normal text-base ${isPromoTime ? 'text-[#fda4af]/70' : 'text-gray-400'} ml-1`
                : `text-sm font-normal ${isPromoTime ? 'text-[#fda4af]/70' : 'text-gray-400'} ml-1`
              } line-through`}
          >
            {currency}
            {baseOriginalPrice}
            {showUnit && unit && <span className="text-xs">/{unit}</span>}
          </span>
        )}
      </div>

      {/* {discountAmount > 0 && !card && (
        <p className="text-xs text-primary-600">
          Save {currency}
          {getNumberTwo(discountAmount)} ({discountPercent}% off)
        </p>
      )} */}
    </>
  );
};

export default Price;

