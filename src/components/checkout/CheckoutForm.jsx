"use client";

import React, { useEffect, useState, useMemo, useContext } from "react";
import Link from "next/link";
import {
  IoReturnUpBackOutline,
  IoArrowForward,
  IoBagHandle,
} from "react-icons/io5";
import useTranslation from "next-translate/useTranslation";

//internal import
import Label from "@components/form/Label";
import Error from "@components/form/Error";
import CartItem from "@components/cart/CartItem";
import InputArea from "@components/form/InputArea";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import AddressManager from "@components/checkout/AddressManager";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";
import ImageWithFallback from "@components/common/ImageWithFallBack";

const CheckoutForm = ({ shippingAddress, hasShippingAddress }) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const { cartDrawerOpen, setCartDrawerOpen } = useContext(SidebarContext);

  useEffect(() => setMounted(true), []);

  const {
    error,
    stripe,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    currency,
    register,
    errors,
    showCard,
    setShowCard,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    useExistingAddress,
    isCouponAvailable,
    globalSetting,
    storeSetting,
    storeCustomization,
    showingTranslateValue,
    handleDefaultShippingAddress,
    setValue,
  } = useCheckoutSubmit({ shippingAddress });
  const checkout = storeCustomization?.checkout;

  // Limit products shown initially (show first 2)
  const MAX_VISIBLE_PRODUCTS = 2;
  const visibleProducts = showAllProducts ? items : items.slice(0, MAX_VISIBLE_PRODUCTS);
  const hasMoreProducts = items.length > MAX_VISIBLE_PRODUCTS;

  // Calculate pricing breakdown
  const pricingBreakdown = useMemo(() => {
    let originalTotalGross = 0;
    let currentTotalGross = 0;
    let totalTaxAmount = 0;
    let totalTaxableAmount = 0;

    items.forEach(item => {
      const quantity = item.quantity || 1;
      const taxPercent = parseFloat(item.taxPercent) || 0;

      // Prices are Gross (Inclusive of tax)
      const itemCurrentPriceGross = parseFloat(item.price) || 0;
      let itemOriginalPriceGross = parseFloat(item.originalPrice || item.prices?.originalPrice || item.prices?.price || 0);

      // Safety net: If baseline is equal to item price, but the item has bulkPricing, try to find the true original
      if (itemOriginalPriceGross <= itemCurrentPriceGross && item.bulkPricing?.bulkRate1?.pricePerUnit > 0) {
        const possibleBase = parseFloat(item.prices?.price || item.prices?.originalPrice || 0);
        if (possibleBase > itemCurrentPriceGross) {
          itemOriginalPriceGross = possibleBase;
        }
      }

      // Final fallback to current price if still 0
      if (itemOriginalPriceGross === 0) itemOriginalPriceGross = itemCurrentPriceGross;

      originalTotalGross += itemOriginalPriceGross * quantity;
      currentTotalGross += itemCurrentPriceGross * quantity;

      // Calculate Taxable Amount and GST Amount for this item
      // GST-exclusive: Taxable = Gross - GST, where GST = Gross × Tax%
      const itemGrossTotal = itemCurrentPriceGross * quantity;
      let itemTaxableAmount, itemGstAmount;

      if (item.taxableRate && item.taxableRate > 0) {
        // Use stored taxableRate
        itemTaxableAmount = item.taxableRate * quantity;
        itemGstAmount = itemGrossTotal - itemTaxableAmount;
      } else {
        // Fallback Markup Logic: Taxable = Gross / (1 + Tax/100)
        itemTaxableAmount = itemGrossTotal / (1 + taxPercent / 100);
        itemGstAmount = itemGrossTotal - itemTaxableAmount;
      }

      totalTaxableAmount += itemTaxableAmount;
      totalTaxAmount += itemGstAmount;
    });

    // Product discount is the difference between original and current prices
    const productDiscount = originalTotalGross > currentTotalGross ? originalTotalGross - currentTotalGross : 0;

    // Shipping settings - always free delivery
    const standardDeliveryCharge = 30;
    const isFreeDelivery = true; // Always free delivery
    const actualDeliveryCharge = 0; // Always free

    // Total = Taxable + GST + Delivery - Discount
    const finalTotal = totalTaxableAmount + totalTaxAmount + actualDeliveryCharge - discountAmount;

    return {
      itemTotalOriginal: originalTotalGross,
      productDiscount: productDiscount,
      taxableSubtotal: totalTaxableAmount,
      totalGst: totalTaxAmount,
      deliveryCharge: actualDeliveryCharge,
      standardDeliveryCharge,
      isFreeDelivery,
      totalCost: finalTotal,
      savings: productDiscount + standardDeliveryCharge, // Always include delivery savings since it's always free
    };
  }, [items, cartTotal, discountAmount]);

  if (!mounted) return null; // or a skeleton loader

  return (
    <div className="py-10 lg:py-12 px-0 2xl:max-w-screen-2xl w-full xl:max-w-screen-xl flex flex-col md:flex-row lg:flex-row">
      {/* checkout form */}
      <div className="md:w-full lg:w-3/5 flex h-full flex-col order-2 sm:order-1 lg:order-1">
        <div className="mt-5 md:mt-0 md:col-span-2">
          {/* <Elements stripe={stripePromise}> */}
          <form onSubmit={handleSubmit(submitHandler)}>
            <div className="form-group">
              <h2 className="font-semibold text-base text-gray-700 pb-3">
                01. Contact Details
              </h2>
              <div className="grid grid-cols-6 gap-4 sm:gap-6">
                <div className="col-span-3">
                  <InputArea
                    register={register}
                    label="First Name"
                    name="firstName"
                    type="text"
                    placeholder="Enter first name"
                  />
                  <Error errorMessage={errors.firstName} />
                </div>

                <div className="col-span-3">
                  <InputArea
                    register={register}
                    label="Last Name"
                    name="lastName"
                    type="text"
                    placeholder="Enter last name"
                  />
                  <Error errorMessage={errors.lastName} />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label label="Mobile Number" />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">+91</span>
                    </div>
                    <Input
                      {...register("contact", { required: "Mobile number is required" })}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      className="py-2 pl-12 pr-4"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Verified via OTP</p>
                  <Error errorMessage={errors.contact} />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <InputArea
                    register={register}
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                  />
                  <Error errorMessage={errors.email} />
                </div>
              </div>
            </div>

            <div className="form-group mt-12">
              {/* Address Manager Component */}
              <AddressManager
                shippingAddress={shippingAddress}
                onAddressSelect={(address) => {
                  // Optionally handle address selection
                  console.log("Selected address:", address);
                }}
                register={register}
                setValue={setValue}
                errors={errors}
              />

              {/* Hidden defaults: no delivery selection, always Razorpay */}
              <input type="hidden" value="Standard Delivery" {...register("shippingOption")} />
              <input type="hidden" value="RazorPay" {...register("paymentMethod")} />
            </div>

            <div className="mt-10">
              <Button
                type="submit"
                disabled={isEmpty || isCheckoutSubmit}
                isLoading={isCheckoutSubmit}
                className="w-full h-12 rounded-lg bg-[#018549] hover:bg-[#016d3b] text-white font-bold shadow-md hover:shadow-lg"
              >
                {isCheckoutSubmit ? (
                  "Processing..."
                ) : (
                  <span className="flex items-center justify-center">
                    Checkout
                    <IoArrowForward className="ml-2 text-lg" />
                  </span>
                )}
              </Button>
            </div>
          </form>
          {/* </Elements> */}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        setOpen={setCartDrawerOpen}
        currency={currency}
      />

      {/* cart section - Redesigned Order Summary */}
      <div className="md:w-full lg:w-2/5 lg:ml-10 xl:ml-14 md:ml-6 flex flex-col h-full md:sticky lg:sticky top-28 md:order-2 lg:order-2">
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden order-1 sm:order-2">
          <div className="p-5 lg:px-6 lg:py-6">
            <h2 className="font-bold text-lg text-gray-900 pb-4">
              {showingTranslateValue(checkout?.order_summary) || "Order Summary"}
            </h2>

            {/* Cart Items */}
            <div className="space-y-2 mb-4">
              {isEmpty ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <span className="flex justify-center my-auto text-gray-400 text-4xl">
                    <IoBagHandle />
                  </span>
                  <h2 className="font-medium text-sm pt-2 text-gray-500">
                    No Item Added Yet!
                  </h2>
                </div>
              ) : (
                <>
                  {visibleProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setCartDrawerOpen(true)}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-md bg-gray-200">
                        <ImageWithFallback
                          img
                          width={64}
                          height={64}
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm font-semibold text-teal-600">
                            {currency}{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {hasMoreProducts && !showAllProducts && (
                    <button
                      onClick={() => setShowAllProducts(true)}
                      className="w-full py-2 text-sm font-medium text-[#018549] hover:text-[#016d3b] transition-colors"
                    >
                      See more ({items.length - MAX_VISIBLE_PRODUCTS} more)
                    </button>
                  )}
                  {showAllProducts && hasMoreProducts && (
                    <button
                      onClick={() => setShowAllProducts(false)}
                      className="w-full py-2 text-sm font-medium text-[#018549] hover:text-[#016d3b] transition-colors"
                    >
                      Show less
                    </button>
                  )}
                  <button
                    onClick={() => setCartDrawerOpen(true)}
                    className="w-full mt-2 py-2 px-4 bg-[#018549] hover:bg-[#016d3b] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    View All Products ({items.length})
                  </button>
                </>
              )}
            </div>

            {/* Coupon Section */}
            <div className="py-3 border-t border-gray-100">
              <form className="w-full">
                {couponInfo.couponCode ? (
                  <div className="bg-[#e6f5ef] px-4 py-3 rounded-lg flex justify-between items-center border border-[#018549]/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#018549]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[#016d3b] font-medium text-sm">Coupon Applied</span>
                    </div>
                    <span className="text-[#025155] font-bold text-sm">
                      {couponInfo.couponCode}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2">
                    <Input
                      ref={couponRef}
                      type="text"
                      placeholder="Coupon Code"
                      className="px-4 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#018549] focus:border-[#018549] flex-1"
                    />
                    <Button
                      onClick={handleCouponCode}
                      className="h-10 rounded-lg px-5"
                      variant="create"
                    >
                      {showingTranslateValue(checkout?.apply_button) || "Apply"}
                    </Button>
                  </div>
                )}
              </form>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              {/* Item Total (Taxable Amount) */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Item total</span>
                <span className="text-gray-900 font-semibold">
                  {currency}{pricingBreakdown.taxableSubtotal.toFixed(2)}
                </span>
              </div>

              {/* GST */}
              {pricingBreakdown.totalGst > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600 font-medium">+ GST</span>
                    <button className="text-gray-400 hover:text-gray-600" title="GST calculated as per product tax rates">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-gray-900 font-semibold">
                    {currency}{pricingBreakdown.totalGst.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Delivery Charge */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Delivery charge</span>
                <div className="flex items-center gap-2">
                  {pricingBreakdown.isFreeDelivery ? (
                    <>
                      <span className="text-gray-400 line-through text-xs">
                        {currency}{pricingBreakdown.standardDeliveryCharge}
                      </span>
                      <span className="text-[#018549] font-bold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        FREE
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-900 font-semibold">
                      {currency}{pricingBreakdown.deliveryCharge.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total Section */}
          <div className="bg-gray-50 px-5 py-4 lg:px-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-bold text-base uppercase">
                {showingTranslateValue(checkout?.total_cost) || "TOTAL COST"}
              </span>
              <span className="text-gray-900 font-extrabold text-xl">
                {currency}{pricingBreakdown.totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;


