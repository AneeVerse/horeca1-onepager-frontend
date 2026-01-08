"use client";

import { useEffect, useRef, useState, useContext } from "react";
import {
    IoAdd,
    IoRemove,
    IoExpand,
    IoBagAdd,
} from "react-icons/fi";
import { useCart } from "react-use-cart";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

//internal import
import Price from "@components/common/Price";
import Tags from "@components/common/Tags";
import useAddToCart from "@hooks/useAddToCart";
import Discount from "@components/common/Discount";
import VariantList from "@components/variants/VariantList";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Stock from "@components/common/Stock";
import useProductAction from "@hooks/useProductAction";
import MainModal from "./MainModal";
import Image from "next/image";
import Link from "next/link";
import { notifyError, notifySuccess } from "@utils/toast";
import { FiMinus, FiPlus } from "react-icons/fi";

const ProductModal = ({
    product,
    modalOpen,
    attributes,
    setModalOpen,
    globalSetting,
}) => {
    const { showingTranslateValue, getNumber, getNumberTwo } = useUtilsFunction();
    const currency = globalSetting?.default_currency || "₹";
    const { item, setItem, handleAddToCart } = useAddToCart();
    const { items, updateItemQuantity, addItem, removeItem } = useCart();
    const router = useRouter();
    const pathname = usePathname();
    const [isPromoTime, setIsPromoTime] = useState(false);
    const [quantityInput, setQuantityInput] = useState(item.toString());
    const [initialized, setInitialized] = useState(false);

    // Sync quantityInput with item when item changes externally (e.g., from buttons)
    // Sync quantityInput with item when item changes externally
    useEffect(() => {
        setQuantityInput(item.toString());
    }, [item]);

    // Initialize item quantity from cart when modal opens
    useEffect(() => {
        if (modalOpen && product) {
            const baseProductId = `${product.id || product._id}`;
            const existingItem = items.find((i) => i.id === baseProductId);
            // If in cart, use that quantity. If not, use 0 (prevents auto-add on mount).
            // User must click '+' to go to 1 and trigger add.
            setItem(existingItem ? existingItem.quantity : 0);
            setInitialized(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalOpen, product]);

    useEffect(() => {
        const checkPromoTime = () => {
            const testHour = process.env.NEXT_PUBLIC_TEST_HOUR;
            let hours;
            if (testHour !== undefined && testHour !== '') {
                hours = parseInt(testHour, 10);
            } else {
                const now = new Date();
                hours = now.getHours();
            }
            const isPromo = hours >= 18 || hours < 9;
            setIsPromoTime(isPromo);
        };
        checkPromoTime();
        const interval = setInterval(checkPromoTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const {
        price,
        stock,
        discount,
        selectedImage,
        originalPrice,
        variantTitle,
        category_name,
        setValue,
        setSelectVa,
        selectVariant,
        setSelectVariant,
    } = useProductAction({
        product,
        attributes,
        globalSetting,
        onCloseModal: () => setModalOpen(false),
        withRouter: true,
    });

    // Calculate savings for a specific bulk pricing tier based on current quantity
    const calculateSavingsForTier = (tierQuantity, bulkPricePerUnit, currentQuantity) => {
        if (!product || tierQuantity < 1 || !bulkPricePerUnit || currentQuantity < tierQuantity) {
            return null;
        }

        // Get single unit base price (use current displayed price for comparison, not originalPrice)
        const singleUnitPrice = price || product?.prices?.price || originalPrice || product?.prices?.originalPrice || 0;

        // Calculate savings: (single price - bulk price) × current quantity
        if (bulkPricePerUnit < singleUnitPrice) {
            const savingsPerUnit = singleUnitPrice - bulkPricePerUnit;
            const totalSavings = savingsPerUnit * currentQuantity;

            if (totalSavings > 0) {
                return {
                    amount: getNumberTwo(totalSavings),
                    quantity: currentQuantity,
                    unit: product?.unit || "pcs"
                };
            }
        }

        return null;
    };

    // Calculate savings for promo pricing tier - uses promo single unit price
    const calculatePromoSavingsForTier = (tierQuantity, bulkPricePerUnit, currentQuantity) => {
        if (!product || tierQuantity < 1 || !bulkPricePerUnit || currentQuantity < tierQuantity) {
            return null;
        }

        // Get promo single unit price for comparison
        const promoSingleUnitPrice = product?.promoPricing?.singleUnit || 0;

        // If no promo single unit price, fall back to regular price
        const singleUnitPrice = promoSingleUnitPrice > 0 ? promoSingleUnitPrice : (price || product?.prices?.price || originalPrice || product?.prices?.originalPrice || 0);

        // Calculate savings: (single price - bulk price) × current quantity
        if (bulkPricePerUnit < singleUnitPrice) {
            const savingsPerUnit = singleUnitPrice - bulkPricePerUnit;
            const totalSavings = savingsPerUnit * currentQuantity;

            if (totalSavings > 0) {
                return {
                    amount: getNumberTwo(totalSavings),
                    quantity: currentQuantity,
                    unit: product?.unit || "pcs"
                };
            }
        }

        return null;
    };

    // Determine the highest active bulk pricing tier based on current quantity
    const determineActiveBulkTier = (bulkPricing, currentQuantity) => {
        if (!bulkPricing || !currentQuantity) return null;

        // Check tier 2 first (highest tier)
        if (bulkPricing.bulkRate2?.quantity > 0 && bulkPricing.bulkRate2?.pricePerUnit > 0 && currentQuantity >= bulkPricing.bulkRate2.quantity) {
            return {
                tier: 'bulkRate2',
                quantity: bulkPricing.bulkRate2.quantity,
                pricePerUnit: bulkPricing.bulkRate2.pricePerUnit
            };
        }

        // Check tier 1
        if (bulkPricing.bulkRate1?.quantity > 0 && bulkPricing.bulkRate1?.pricePerUnit > 0 && currentQuantity >= bulkPricing.bulkRate1.quantity) {
            return {
                tier: 'bulkRate1',
                quantity: bulkPricing.bulkRate1.quantity,
                pricePerUnit: bulkPricing.bulkRate1.pricePerUnit
            };
        }

        return null;
    };

    // Helper function to calculate price based on quantity and bulk/promo pricing
    const getPriceForQuantity = (productData, totalQuantity) => {
        // Check promo pricing first if promo time
        if (isPromoTime && productData?.promoPricing) {
            if (productData.promoPricing?.bulkRate2?.quantity > 0 && totalQuantity >= productData.promoPricing.bulkRate2.quantity) {
                return productData.promoPricing.bulkRate2.pricePerUnit;
            }
            if (productData.promoPricing?.bulkRate1?.quantity > 0 && totalQuantity >= productData.promoPricing.bulkRate1.quantity) {
                return productData.promoPricing.bulkRate1.pricePerUnit;
            }
            if (productData.promoPricing?.singleUnit > 0) {
                return productData.promoPricing.singleUnit;
            }
        }

        // Use bulkPricing
        if (productData?.bulkPricing?.bulkRate2?.quantity > 0 && totalQuantity >= productData.bulkPricing.bulkRate2.quantity) {
            return productData.bulkPricing.bulkRate2.pricePerUnit;
        }
        if (productData?.bulkPricing?.bulkRate1?.quantity > 0 && totalQuantity >= productData.bulkPricing.bulkRate1.quantity) {
            return productData.bulkPricing.bulkRate1.pricePerUnit;
        }
        // Default to current price
        return price || productData?.prices?.price || 0;
    };

    // Helper function to prepare cart item
    const prepareCartItem = (productData, quantity, calculatedPrice) => {
        const { variants, categories, description, ...updatedProduct } = productData;
        const baseProductId = `${productData.id || productData._id}`; // Ensure unique ID as string

        // Handle variants - check if product has variants and if all are selected
        const hasVariants = productData?.variants?.length > 0;
        const selectedVariantName = variantTitle
            ?.map((att) =>
                att?.variants?.find((v) => v._id === selectVariant[att._id])
            )
            .map((el) => showingTranslateValue(el?.name));

        // Determine product ID - with variant suffix if variants exist
        let productId;
        let productTitle;

        if (hasVariants) {
            // Check if all variants are selected
            const allVariantsSelected = variantTitle?.length > 0 &&
                variantTitle.every((att) => selectVariant[att._id]);

            if (!allVariantsSelected) {
                // Variants not fully selected - return null to prevent adding
                return null;
            }

            // Build variant ID suffix
            const variantSuffix = variantTitle?.map((att) => selectVariant[att._id]).join("-");
            productId = baseProductId + "-" + variantSuffix;
            productTitle = showingTranslateValue(productData?.title) + "-" + selectedVariantName?.join("-");
        } else {
            productId = baseProductId;
            productTitle = showingTranslateValue(productData?.title);
        }

        return {
            ...updatedProduct,
            id: productId,
            title: productTitle,
            price: calculatedPrice,
            originalPrice: originalPrice || productData?.prices?.originalPrice || productData?.prices?.price,
            bulkPricing: productData.bulkPricing,
            promoPricing: productData.promoPricing,
            sku: productData.sku,
            hsn: productData.hsn,
            unit: productData.unit,
            brand: productData.brand,
            taxPercent: productData.taxPercent || 0,
            taxableRate: productData.taxableRate || 0,
            image: selectedImage || productData.image?.[0],
            variant: hasVariants ? selectVariant : {},
            stock: hasVariants ? (selectVariant?.quantity || productData?.variant?.quantity || productData?.stock || 0) : (productData.stock || productData.quantity || 0),
        };
    };

    // Add or update cart when quantity changes
    useEffect(() => {
        if (!initialized || !modalOpen || (!product?._id && !product?.id) || item < 0) return;

        // Check authentication before adding/updating cart
        const userInfoCookie = Cookies.get("userInfo");
        if (!userInfoCookie) {
            // Redirect to login page with current page as redirectUrl
            router.push(`/auth/otp-login?redirectUrl=${encodeURIComponent(pathname)}`);
            return;
        }

        // Check if product has variants and if all are selected
        const hasVariants = product?.variants?.length > 0;
        if (hasVariants) {
            const allVariantsSelected = variantTitle?.length > 0 &&
                variantTitle.every((att) => selectVariant[att._id]);
            if (!allVariantsSelected) {
                // Don't add to cart if variants not fully selected
                return;
            }
        }

        // Prepare cart item to get the correct product ID (with variant suffix if applicable)
        const calculatedPrice = getPriceForQuantity(product, item);
        const preparedItem = prepareCartItem(product, item, calculatedPrice);

        if (!preparedItem) {
            // Variants not selected or other issue
            return;
        }

        const productId = preparedItem.id;
        const cartItem = items.find((cartItem) => cartItem.id === productId);

        // Validate stock
        const availableStock = product?.variants?.length > 0
            ? (selectVariant?.quantity || product?.variant?.quantity || product?.stock || 0)
            : (stock || product?.stock || product?.quantity || 0);

        // Check minimum order quantity
        const minQty = product?.minOrderQuantity || 1;

        // If quantity is below minimum, set to minimum (but allow 0 to remove from cart)
        if (item > 0 && item < minQty) {
            setItem(minQty);
            return;
        }

        if (item === 0) {
            if (cartItem) {
                removeItem(cartItem.id);
                // notifyError("Item removed from cart!");
            }
            return;
        }

        if (item > availableStock) {
            notifyError("Insufficient stock!");
            setItem(Math.max(minQty, availableStock));
            return;
        }

        if (cartItem) {
            // Product is in cart - update quantity/price
            if (item === cartItem.quantity) return; // No change needed

            const newPrice = getPriceForQuantity(product, item);
            const priceChanged = Math.abs(cartItem.price - newPrice) > 0.01;

            if (priceChanged) {
                // Price changed - remove and re-add with new price and quantity
                removeItem(cartItem.id);
                requestAnimationFrame(() => {
                    const newCartItem = prepareCartItem(product, item, newPrice);
                    if (newCartItem) {
                        addItem(newCartItem, item);
                    }
                });
            } else {
                // Price stays the same, just update quantity
                updateItemQuantity(cartItem.id, item);
            }
        } else {
            // Product is NOT in cart - add to cart (only show notification on initial add)
            if (preparedItem) {
                addItem(preparedItem, item);
                // Only show success notification when adding for the first time, not on updates
            }
        }
    }, [item, modalOpen, product, items, isPromoTime, price, originalPrice, showingTranslateValue, removeItem, addItem, updateItemQuantity, stock, selectVariant, selectedImage, router, pathname, variantTitle]);

    return (
        <MainModal
            modalOpen={modalOpen}
            bottomCloseBtn={false}
            handleCloseModal={() => setModalOpen(false)}
        >
            <div className="inline-block overflow-y-auto h-full align-middle transition-all transform w-full max-w-2xl mx-auto">
                <div data-modal-content className="w-full overflow-hidden">
                    {/* Mobile Layout: Image Left, Details Right */}
                    <div className="lg:hidden flex flex-row gap-3 mb-4">
                        {/* Mobile: Small Image on Left */}
                        <div className="flex-shrink-0 w-20 h-20 min-[345px]:w-24 min-[345px]:h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100">
                            {product.image?.[0] ? (
                                <Image
                                    src={selectedImage || product.image[0]}
                                    width={112}
                                    height={112}
                                    alt="product"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <Image
                                    src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                                    width={112}
                                    height={112}
                                    alt="product Image"
                                    className="object-cover w-full h-full"
                                />
                            )}
                        </div>

                        {/* Mobile: Product Title and Info on Right */}
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                            <h2 className="text-heading text-sm min-[345px]:text-base sm:text-lg font-semibold leading-tight line-clamp-2 mb-1">
                                {showingTranslateValue(product?.title)}
                            </h2>
                            <div className="flex items-center gap-2 text-[10px] min-[345px]:text-xs text-gray-500">
                                {product?.unit && <span>{product.unit}</span>}
                                <span className="text-gray-300">|</span>
                                <Stock In stock={stock} />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout: Compact Layout */}
                    <div className="hidden lg:flex flex-row w-full gap-5">
                        {/* Left Side: Product Image (Fixed Smaller) */}
                        <div className="w-[200px] flex-shrink-0">
                            <div data-product-image-container className="flex-shrink-0 flex items-center justify-center w-full aspect-square bg-gray-50 rounded-lg overflow-hidden relative border border-gray-100">
                                {product.image?.[0] ? (
                                    <Image
                                        src={selectedImage || product.image[0]}
                                        width={200}
                                        height={200}
                                        alt="product"
                                        className="object-contain w-full h-full p-2"
                                    />
                                ) : (
                                    <Image
                                        src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                                        width={200}
                                        height={200}
                                        alt="product Image"
                                        className="object-contain w-full h-full p-2"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right Side: Product Details (Compact) */}
                        <div className="flex-1 min-w-0">
                            {/* Header Content: Category, Stock, Title */}
                            <div className="flex flex-col gap-1 mb-2">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category:</span>
                                    <Link
                                        href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                                        className="text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700"
                                    >
                                        {category_name}
                                    </Link>
                                    <Stock In stock={stock} />
                                    {product?.minOrderQuantity > 1 && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                            Min Qty: {product.minOrderQuantity}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h2 className="text-heading text-lg font-bold mb-3 leading-tight">
                                {showingTranslateValue(product?.title)}
                            </h2>

                            {/* Price and Discount (Desktop) */}
                            <div className="flex items-center justify-between my-4">
                                <div className="flex items-center">
                                    <Price
                                        price={getPriceForQuantity(product, item)}
                                        product={product}
                                        currency={currency}
                                        originalPrice={originalPrice}
                                    />
                                    <span className="ml-2">
                                        <Discount slug product={product} discount={discount} />
                                    </span>
                                </div>
                                {/* Quantity Selector (Desktop) */}
                                <div
                                    className={`group flex items-center rounded-full overflow-hidden flex-shrink-0 border ${isPromoTime ? 'bg-[#ffe4e6] border-[#fda4af]' : 'bg-[#d1fae5] border-[#5ee9b5]'
                                        }`}
                                >
                                    <button
                                        onClick={() => {
                                            const minQty = product?.minOrderQuantity || 1;
                                            if (item <= minQty) {
                                                setItem(0);
                                                setQuantityInput('0');
                                            } else {
                                                const newQty = item - 1;
                                                setItem(newQty);
                                                setQuantityInput(newQty.toString());
                                            }
                                        }}
                                        disabled={item <= 0}
                                        className={`flex items-center cursor-pointer justify-center py-2 px-3 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-10 text-heading border-e ${isPromoTime ? 'hover:bg-[#fecdd3] border-[#fda4af]/30' : 'hover:bg-[#b9f6e1] border-[#5ee9b5]/30'
                                            }`}
                                    >
                                        <FiMinus style={{ color: isPromoTime ? '#be123c' : '#065f46' }} className="text-lg stroke-[3]" />
                                    </button>
                                    <input
                                        type="number"
                                        min="0"
                                        max={product.quantity || 9999}
                                        value={quantityInput}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setQuantityInput(value);
                                            const numValue = parseInt(value, 10);
                                            if (value === '' || isNaN(numValue)) return;
                                            if (numValue >= 0) {
                                                const maxQuantity = product.quantity || 9999;
                                                setItem(Math.min(numValue, maxQuantity));
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = e.target.value;
                                            const numValue = parseInt(value, 10);
                                            const minQty = product?.minOrderQuantity || 1;
                                            if (value === '' || isNaN(numValue) || numValue <= 0) {
                                                setItem(0);
                                                setQuantityInput('0');
                                            } else if (numValue < minQty) {
                                                setItem(minQty);
                                                setQuantityInput(minQty.toString());
                                                notifyError(`Minimum order quantity for this product is ${minQty}`);
                                            } else {
                                                const maxQuantity = product.quantity || 9999;
                                                const finalValue = Math.min(numValue, maxQuantity);
                                                setItem(finalValue);
                                                setQuantityInput(finalValue.toString());
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.target.blur();
                                        }}
                                        className={`font-bold text-[10px] px-3 min-w-[2.5rem] text-center border-y-0 border-x outline-none focus:outline-none focus:ring-0 bg-white ${isPromoTime ? 'text-[#be123c] border-[#fda4af]/30' : 'text-[#065f46] border-[#5ee9b5]/30'
                                            } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                                    />
                                    <button
                                        onClick={() => {
                                            const minQty = product?.minOrderQuantity || 1;
                                            const maxQuantity = product.quantity || 9999;
                                            if (item === 0) {
                                                setItem(minQty);
                                                setQuantityInput(minQty.toString());
                                            } else if (item < maxQuantity) {
                                                const newQty = item + 1;
                                                setItem(newQty);
                                                setQuantityInput(newQty.toString());
                                            }
                                        }}
                                        disabled={product.quantity <= item}
                                        className={`flex items-center cursor-pointer justify-center py-2 px-3 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-10 text-heading border-s ${isPromoTime ? 'hover:bg-[#fecdd3] border-[#fda4af]/30' : 'hover:bg-[#b9f6e1] border-[#5ee9b5]/30'
                                            }`}
                                    >
                                        <FiPlus style={{ color: isPromoTime ? '#be123c' : '#065f46' }} className="text-lg stroke-[3]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile: Price and Quantity Selector Row */}
                    <div className="lg:hidden flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Price
                                price={getPriceForQuantity(product, item)}
                                product={product}
                                currency={currency}
                                originalPrice={originalPrice}
                            />
                        </div>
                        {/* Quantity Selector (Mobile) */}
                        <div
                            className={`group flex items-center rounded-full overflow-hidden flex-shrink-0 border ${isPromoTime ? 'bg-[#ffe4e6] border-[#fda4af]' : 'bg-[#d1fae5] border-[#5ee9b5]'
                                }`}
                        >
                            <button
                                onClick={() => {
                                    const minQty = product?.minOrderQuantity || 1;
                                    if (item <= minQty) {
                                        setItem(0);
                                        setQuantityInput('0');
                                    } else {
                                        const newQty = item - 1;
                                        setItem(newQty);
                                        setQuantityInput(newQty.toString());
                                    }
                                }}
                                disabled={item <= 0}
                                className={`flex items-center cursor-pointer justify-center py-1.5 px-2 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-7 sm:w-8 text-heading border-e ${isPromoTime ? 'hover:bg-[#fecdd3] border-[#fda4af]/30' : 'hover:bg-[#b9f6e1] border-[#5ee9b5]/30'
                                    }`}
                            >
                                <FiMinus style={{ color: isPromoTime ? '#be123c' : '#065f46' }} className="text-sm sm:text-base stroke-[3]" />
                            </button>
                            <input
                                type="number"
                                min="0"
                                max={product.quantity || 9999}
                                value={quantityInput}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setQuantityInput(value);
                                    const numValue = parseInt(value, 10);
                                    if (value === '' || isNaN(numValue)) return;
                                    if (numValue >= 0) {
                                        const maxQuantity = product.quantity || 9999;
                                        setItem(Math.min(numValue, maxQuantity));
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseInt(value, 10);
                                    const minQty = product?.minOrderQuantity || 1;
                                    if (value === '' || isNaN(numValue) || numValue <= 0) {
                                        setItem(0);
                                        setQuantityInput('0');
                                    } else if (numValue < minQty) {
                                        setItem(minQty);
                                        setQuantityInput(minQty.toString());
                                        notifyError(`Minimum order quantity for this product is ${minQty}`);
                                    } else {
                                        const maxQuantity = product.quantity || 9999;
                                        const finalValue = Math.min(numValue, maxQuantity);
                                        setItem(finalValue);
                                        setQuantityInput(finalValue.toString());
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.target.blur();
                                }}
                                className={`font-bold text-xs px-2 w-10 text-center border-y-0 border-x outline-none focus:outline-none focus:ring-0 bg-white ${isPromoTime ? 'text-[#be123c] border-[#fda4af]/30' : 'text-[#065f46] border-[#5ee9b5]/30'
                                    } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                            />
                            <button
                                onClick={() => {
                                    const minQty = product?.minOrderQuantity || 1;
                                    const maxQuantity = product.quantity || 9999;
                                    if (item === 0) {
                                        setItem(minQty);
                                        setQuantityInput(minQty.toString());
                                    } else if (item < maxQuantity) {
                                        const newQty = item + 1;
                                        setItem(newQty);
                                        setQuantityInput(newQty.toString());
                                    }
                                }}
                                disabled={product.quantity <= item}
                                className={`flex items-center cursor-pointer justify-center py-1.5 px-2 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-7 sm:w-8 text-heading border-s ${isPromoTime ? 'hover:bg-[#fecdd3] border-[#fda4af]/30' : 'hover:bg-[#b9f6e1] border-[#5ee9b5]/30'
                                    }`}
                            >
                                <FiPlus style={{ color: isPromoTime ? '#be123c' : '#065f46' }} className="text-sm sm:text-base stroke-[3]" />
                            </button>
                        </div>
                    </div>

                    {/* Bulk Pricing Display - Hide during promo time */}
                    {(() => {
                        const shouldShowBulk = !isPromoTime && product?.bulkPricing && (product?.bulkPricing?.bulkRate1?.quantity > 0 || product?.bulkPricing?.bulkRate2?.quantity > 0);
                        if (!shouldShowBulk) return null;

                        // Determine state
                        const activeTier = determineActiveBulkTier(product?.bulkPricing, item);
                        const isTier1Active = activeTier?.tier === 'bulkRate1';
                        const isTier2Active = activeTier?.tier === 'bulkRate2';

                        const tier1Savings = calculateSavingsForTier(product?.bulkPricing?.bulkRate1?.quantity, product?.bulkPricing?.bulkRate1?.pricePerUnit, item);
                        const tier2Savings = calculateSavingsForTier(product?.bulkPricing?.bulkRate2?.quantity, product?.bulkPricing?.bulkRate2?.pricePerUnit, item);

                        // Scenario 2: Tier 2 active - hide entire section, show savings banner if exists
                        if (isTier2Active) {
                            return (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    {tier2Savings ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-green-700">
                                                {currency}{tier2Savings.amount} saved on {tier2Savings.quantity} {tier2Savings.unit}
                                            </span>
                                            <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-green-700">Bulk Price Applied</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-green-700">
                                                    {currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                                </span>
                                                <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full flex-shrink-0">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Scenario 1: Tier 1 active - hide tier 1 row, show tier 1 savings banner, show tier 2 with Add button
                        if (isTier1Active) {
                            return (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Bulk Pricing</h4>
                                    {/* Tier 1 Savings Banner */}
                                    {tier1Savings ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-green-700">
                                                {currency}{tier1Savings.amount} saved on {tier1Savings.quantity} {tier1Savings.unit}
                                            </span>
                                            <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-green-700">Bulk Price Applied</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-green-700">
                                                    {currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}
                                                </span>
                                                <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full flex-shrink-0">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Tier 2 - Show with Add button */}
                                    {product?.bulkPricing?.bulkRate2?.quantity > 0 && product?.bulkPricing?.bulkRate2?.pricePerUnit > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-primary-600 font-medium">
                                                Buy {product.bulkPricing.bulkRate2.quantity}+ {product.unit || "units"}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-primary-700">
                                                    {currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                                </span>
                                                <button
                                                    onClick={() => setItem(product.bulkPricing.bulkRate2.quantity)}
                                                    className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                                                >
                                                    Add {product.bulkPricing.bulkRate2.quantity}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Scenario 3: No tier active - show all tiers with Add buttons
                        return (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bulk Pricing</h4>
                                {product?.bulkPricing?.bulkRate1?.quantity > 0 && product?.bulkPricing?.bulkRate1?.pricePerUnit > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-primary-600 font-medium">
                                            Buy {product.bulkPricing.bulkRate1.quantity}+ {product.unit || "units"}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-primary-700">
                                                {currency}{product.bulkPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}
                                            </span>
                                            <button
                                                onClick={() => setItem(product.bulkPricing.bulkRate1.quantity)}
                                                className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                                            >
                                                Add {product.bulkPricing.bulkRate1.quantity}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {product?.bulkPricing?.bulkRate2?.quantity > 0 && product?.bulkPricing?.bulkRate2?.pricePerUnit > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-primary-600 font-medium">
                                            Buy {product.bulkPricing.bulkRate2.quantity}+ {product.unit || "units"}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-primary-700">
                                                {currency}{product.bulkPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                            </span>
                                            <button
                                                onClick={() => setItem(product.bulkPricing.bulkRate2.quantity)}
                                                className="text-xs font-semibold text-white bg-[#018549] hover:bg-[#016d3b] px-3 py-1 rounded transition-colors"
                                            >
                                                Add {product.bulkPricing.bulkRate2.quantity}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Savings Banner - Show directly below bulk pricing */}

                    {/* Promo Bulk Pricing Display - Premium Unified Happy Hour Design */}
                    {/* Promo Bulk Pricing Display - Premium Unified Happy Hour Design */}
                    {product?.promoPricing && (product?.promoPricing?.singleUnit > 0 || product?.promoPricing?.bulkRate1?.quantity > 0 || product?.promoPricing?.bulkRate2?.quantity > 0) && (
                        <div className="rounded-lg p-3.5 mb-5 space-y-3 border shadow-xl relative overflow-hidden group transition-all duration-500 bg-gradient-to-br from-[#881337] via-[#9d174d] to-[#be123c] border-white/20">
                            {/* Decorative Animated Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500 bg-rose-400/20"></div>

                            <div className="relative z-10 flex items-center mb-1">
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 transition-colors duration-500 text-[#be123c] bg-[#ffe4e6]">
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#be123c]"></span>
                                    PROMO - 6pm to 9am
                                </span>
                            </div>

                            {product?.promoPricing?.singleUnit > 0 && (
                                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                                    <span className="text-xs font-semibold text-rose-100">Single Unit Price</span>
                                    <span className="text-sm font-black transition-colors duration-500 text-[#fbcfe8]">
                                        {currency}{product.promoPricing.singleUnit}/{product.unit || "Pc"}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-3">
                                {(() => {
                                    // Base tiers
                                    const tiers = [
                                        { data: product?.promoPricing?.bulkRate1, id: 1 },
                                        { data: product?.promoPricing?.bulkRate2, id: 2 }
                                    ];

                                    return tiers.map(({ data, id }) => {
                                        if (!data || data.quantity <= 0 || data.pricePerUnit <= 0) return null;

                                        const isActive = isPromoTime && (
                                            (id === 1 && item >= data.quantity && (!product.promoPricing.bulkRate2?.quantity || item < product.promoPricing.bulkRate2.quantity)) ||
                                            (id === 2 && item >= data.quantity)
                                        );

                                        return (
                                            <div key={id} className={`relative z-10 flex items-center justify-between rounded-lg p-2 transition-all duration-300 ${isActive ? 'bg-white/15 ring-1 ring-white/30' : ''}`}>
                                                <span className="text-xs font-medium text-rose-50">
                                                    Buy {data.quantity}+ {product.unit || "Pc"}
                                                </span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold transition-colors duration-500 text-[#fce7f3]">
                                                        {currency}{data.pricePerUnit}/{product.unit || "Pc"}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!isPromoTime) {
                                                                notifyError("Offer starts at 6 PM!");
                                                            } else {
                                                                setItem(data.quantity);
                                                            }
                                                        }}
                                                        className="text-[10px] font-black px-4 py-2 rounded-md transition-all active:scale-95 shadow-lg whitespace-nowrap border text-white bg-white/10 hover:bg-white/25 border-white/20"
                                                    >
                                                        Add {data.quantity}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Variants */}
                    <div className="mb-6">
                        {variantTitle?.map((a) => (
                            <span key={a._id} className="mb-2 block">
                                <h4 className="text-sm py-1 text-gray-800 font-medium">
                                    {showingTranslateValue(a?.name)}:
                                </h4>
                                <VariantList
                                    att={a._id}
                                    option={a.option}
                                    setValue={setValue}
                                    varTitle={variantTitle}
                                    variants={product?.variants}
                                    setSelectVa={setSelectVa}
                                    selectVariant={selectVariant}
                                    setSelectVariant={setSelectVariant}
                                />
                            </span>
                        ))}
                    </div>

                    {/* Tags */}
                    <div className="flex items-center mt-6">
                        <Tags product={product} />
                    </div>
                </div>
            </div>
        </MainModal>
    );
};

export default dynamic(() => Promise.resolve(ProductModal), { ssr: false });
