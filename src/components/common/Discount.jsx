import useUtilsFunction from "@hooks/useUtilsFunction";

const Discount = ({ discount, product, slug, modal }) => {
  const { getNumber } = useUtilsFunction();

  const price = product?.isCombination
    ? getNumber(product?.variants?.[0]?.price)
    : getNumber(product?.prices?.price);

  const originalPrice = product?.isCombination
    ? getNumber(product?.variants?.[0]?.originalPrice)
    : getNumber(product?.prices?.originalPrice);

  const discountPercentage =
    originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return null;
};

export default Discount;

