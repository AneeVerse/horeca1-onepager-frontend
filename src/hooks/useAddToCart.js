import { useState } from "react";
import { useCart } from "react-use-cart";
import { useContext } from "react";
import { SidebarContext } from "@context/SidebarContext";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

import { notifyError, notifySuccess } from "@utils/toast";
import { getTaxableRate } from "@utils/pricing";

const useAddToCart = () => {
  const [item, setItem] = useState(1);
  const { addItem, items, updateItemQuantity, totalItems, removeItem } = useCart();
  const { setCartDrawerOpen } = useContext(SidebarContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleAddItem = (product) => {
    // Check if user is authenticated before adding to cart
    const userInfoCookie = Cookies.get("userInfo");
    if (!userInfoCookie) {
      // Redirect to login page with current page as redirectUrl
      router.push(`/auth/otp-login?redirectUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const baseProductId = `${product.id || product._id}`;
    let result = items.find((i) => i.id == baseProductId);

    // Handle legacy items migration (Number vs String ID)
    if (result && result.id !== baseProductId) {
      removeItem(result.id);
      // Add legacy quantity to current request so we merge them
      // Wait, addItem adds TO existing if ID matches? No, we removed it.
      // So we treat it as a new add with (legacy_qty + new_qty)
      // But wait, the `item` state is just the *new* quantity to add.
      // The `addItem` function usually merges if ID exists, or creates new.
      // Since we removed it, we must add `result.quantity` (old) + `item` (new).
      // BUT, we can just let `addItem` handle it IF we hadn't removed it?
      // The problem is `addItem` uses the ID in the object passed to it.
      // If we pass object with String ID, it won't find the Number ID item, and will creaate duplicate.
      // So yes, we MUST remove old, and add (old + new).

      // Update the quantity we are about to add to include the old quantity
      // We can't easily change `item` state here. We'll pass explicit quantity to addItem.
    }

    // Calculate final quantity to add (if we found a legacy item, we need to re-add its quantity too)
    let quantityToAdd = item;
    if (result && result.id !== baseProductId) {
      quantityToAdd = result.quantity + item;
      result = undefined; // Treated as new item now
    }

    const { variants, categories, description, ...updatedProduct } = product;

    const { checkIsPromoTime } = require("@utils/date");
    const isPromoTime = checkIsPromoTime();

    // Get taxable rate based on active bulk tier for the quantity being added
    const taxableRate = getTaxableRate(product, quantityToAdd, isPromoTime);

    const cartItem = {
      ...updatedProduct,
      id: baseProductId,
      sku: product.sku,
      hsn: product.hsn,
      unit: product.unit,
      brand: product.brand,
      taxPercent: product.taxPercent || 0,
      taxableRate: taxableRate,
      originalPrice: product.prices?.originalPrice || product.originalPrice || product.prices?.price || product.price,
      // Store pricing structures for dynamic price calculation based on promo time
      bulkPricing: product.bulkPricing || null,
      promoPricing: product.promoPricing || null,
      prices: product.prices || { price: product.price, originalPrice: product.originalPrice },
    };

    const availableStock = product?.variants?.length > 0
      ? (product?.variant?.quantity || 0)
      : (product?.stock || 0);

    if (result !== undefined) {
      // Item exists (and IDs match, so no migration needed)
      if (result?.quantity + quantityToAdd <= availableStock) {
        addItem(cartItem, quantityToAdd);
        notifySuccess(`${quantityToAdd} ${product.title} added to cart!`);
      } else {
        notifyError("Insufficient stock!");
      }
    } else {
      // New item (or migrated item)
      if (quantityToAdd <= availableStock) {
        addItem(cartItem, quantityToAdd);
        notifySuccess(`${item} ${product.title} added to cart!`);
      } else {
        notifyError("Insufficient stock!");
      }
    }
  };

  const handleIncreaseQuantity = (product) => {
    const result = items?.find((p) => p.id === product.id);
    // console.log(
    //   "handleIncreaseQuantity",
    //   product,
    //   result?.quantity + item,
    //   product?.variants?.length > 0
    //     ? product?.variant?.quantity
    //     : product?.stock
    // );
    if (result) {
      if (
        result?.quantity + item <=
        (product?.variants?.length > 0
          ? product?.variant?.quantity
          : product?.stock)
      ) {
        updateItemQuantity(product.id, product.quantity + 1);
      } else {
        notifyError("Insufficient stock!");
      }
    }
  };

  return {
    item,
    setItem,
    totalItems,
    handleAddItem,
    handleIncreaseQuantity,
  };
};

export default useAddToCart;

