import Link from "next/link";
import { useCart } from "react-use-cart";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useState, useEffect } from "react";

//internal import
import useAddToCart from "@hooks/useAddToCart";
import ImageWithFallback from "@components/common/ImageWithFallBack";

// Helper function to calculate the appropriate price based on total quantity and bulk pricing
const getPriceForQuantity = (item, totalQuantity) => {
  // Check if current time is promo time (6pm-9am)
  const now = new Date();
  const hours = now.getHours();
  const isPromoTime = hours >= 18 || hours < 9;

  // Check promo pricing first if promo time
  if (isPromoTime && item?.promoPricing) {
    if (item.promoPricing?.bulkRate2?.quantity > 0 && totalQuantity >= item.promoPricing.bulkRate2.quantity) {
      return item.promoPricing.bulkRate2.pricePerUnit;
    }
    if (item.promoPricing?.bulkRate1?.quantity > 0 && totalQuantity >= item.promoPricing.bulkRate1.quantity) {
      return item.promoPricing.bulkRate1.pricePerUnit;
    }
    if (item.promoPricing?.singleUnit > 0) {
      return item.promoPricing.singleUnit;
    }
  }

  // Use bulkPricing stored in cart item
  if (item?.bulkPricing?.bulkRate2?.quantity > 0 && totalQuantity >= item.bulkPricing.bulkRate2.quantity) {
    return item.bulkPricing.bulkRate2.pricePerUnit;
  }
  if (item?.bulkPricing?.bulkRate1?.quantity > 0 && totalQuantity >= item.bulkPricing.bulkRate1.quantity) {
    return item.bulkPricing.bulkRate1.pricePerUnit;
  }
  // Default to current price if no bulk pricing
  return item.price;
};

const CartItem = ({ item, currency }) => {
  const { updateItemQuantity, removeItem, addItem, updateItem } = useCart();
  const [inputValue, setInputValue] = useState(item.quantity.toString());

  // Update input value when item quantity changes externally
  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  // Handle increment with price recalculation
  const handleIncrement = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newQuantity = item.quantity + 1;
    const newPrice = getPriceForQuantity(item, newQuantity);

    // Atomically update both quantity and price (if changed)
    if (item.price !== newPrice) {
      updateItem(item.id, { price: newPrice, quantity: newQuantity });
    } else {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  // Handle decrement with price recalculation
  const handleDecrement = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (item.quantity <= 1) {
      removeItem(item.id);
      return;
    }

    const newQuantity = item.quantity - 1;
    const newPrice = getPriceForQuantity(item, newQuantity);

    // Atomically update both quantity and price (if changed)
    if (item.price !== newPrice) {
      updateItem(item.id, { price: newPrice, quantity: newQuantity });
    } else {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  // Handle direct quantity input
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty input for editing
    if (value === '') {
      setInputValue('');
      return;
    }
    // Only allow numbers
    if (!/^\d+$/.test(value)) {
      return;
    }
    setInputValue(value);
  };

  // Handle quantity input blur or Enter key
  const handleQuantityBlur = () => {
    const newQuantity = parseInt(inputValue, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      // Reset to current quantity if invalid
      setInputValue(item.quantity.toString());
      return;
    }
    if (newQuantity === item.quantity) {
      // No change, just reset input
      setInputValue(item.quantity.toString());
      return;
    }

    const newPrice = getPriceForQuantity(item, newQuantity);

    // Atomically update both quantity and price (if changed)
    if (item.price !== newPrice) {
      updateItem(item.id, { price: newPrice, quantity: newQuantity });
    } else {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  const handleQuantityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuantityBlur();
    }
  };

  return (
    <div className="group w-full h-auto flex justify-start items-center py-4 transition-all relative border-b border-gray-200 last:border-b-0">
      <div className="relative flex overflow-hidden flex-shrink-0 cursor-pointer mr-4 w-20 h-20">
        <ImageWithFallback
          img
          width={80}
          height={80}
          src={item.image}
          alt={item.title}
          className="w-full h-full flex-none rounded-md bg-gray-100 object-contain"
        />
      </div>
      <div className="flex flex-col w-full overflow-hidden">
        <div className="flex">
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${item.slug}`}
              // onClick={closeCartDrawer}
              className="truncate text-sm font-medium text-gray-700 text-heading line-clamp-1"
            >
              {item.title}
            </Link>
            <span className="text-xs text-gray-400 mb-1">
              Item Price {currency}{item.price}
            </span>
          </div>
          <div className="ml-4 flow-root shrink-0">
            <button
              onClick={() => removeItem(item.id)}
              className="hover:text-red-600 text-red-400 text-lg cursor-pointer"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-bold text-teal-600 hover:text-teal-700 text-sm md:text-base text-heading leading-5">
            <span>
              {currency}
              {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>

          <div className="h-8 w-22 md:w-24 lg:w-24 flex flex-wrap items-center justify-evenly p-1 border border-gray-100 bg-white text-gray-600 rounded-full">
            <button onClick={handleDecrement}>
              <span className="text-dark text-base cursor-pointer hover:bg-gray-100">
                <FiMinus />
              </span>
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              onKeyDown={handleQuantityKeyDown}
              className="quantity-input text-xs sm:text-sm font-semibold text-gray-900 px-0.5 sm:px-1 w-6 sm:w-8 text-center border-none outline-none bg-transparent focus:bg-transparent focus:text-gray-900"
              style={{ color: '#111827' }}
            />
            <button onClick={handleIncrement}>
              <span className="text-dark text-base cursor-pointer hover:bg-gray-100">
                <FiPlus />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

