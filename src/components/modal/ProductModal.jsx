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
import { notifyError } from "@utils/toast";
import { FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";

const ProductModal = ({
    product,
    modalOpen,
    attributes,
    setModalOpen,
    globalSetting,
}) => {
    const { showingTranslateValue } = useUtilsFunction();
    const currency = globalSetting?.default_currency || "₹";
    const { item, setItem, handleAddToCart } = useAddToCart();
    const [isPromoTime, setIsPromoTime] = useState(false);

    useEffect(() => {
        const checkPromoTime = () => {
            const now = new Date();
            const hours = now.getHours();
            setIsPromoTime(hours >= 18 || hours < 9);
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

    return (
        <MainModal
            modalOpen={modalOpen}
            bottomCloseBtn={false}
            handleCloseModal={() => setModalOpen(false)}
        >
            <div className="inline-block overflow-y-auto h-full align-middle transition-all transform">
                <div className="lg:flex flex-col lg:flex-row md:flex-row w-full max-w-4xl overflow-hidden">
                    {/* Left Side: Product Image */}
                    <div className="w-full lg:w-[40%]">
                        <div className="flex-shrink-0 flex items-center justify-center h-auto bg-gray-50">
                            {product.image?.[0] ? (
                                <Image
                                    src={selectedImage || product.image[0]}
                                    width={420}
                                    height={420}
                                    alt="product"
                                    className="object-contain"
                                />
                            ) : (
                                <Image
                                    src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                                    width={420}
                                    height={420}
                                    alt="product Image"
                                    className="object-contain"
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Side: Product Details */}
                    <div className="w-full lg:w-[60%] pt-6 lg:pt-0 lg:pl-7 xl:pl-10">
                        {/* Header Content: Category, Stock, Title */}
                        <div className="flex flex-col gap-1 mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category:</span>
                                <Link
                                    href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                                    className="text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700"
                                >
                                    {category_name}
                                </Link>
                            </div>
                            <div className="relative">
                                <Stock In stock={stock} />
                            </div>
                        </div>

                        <h2 className="text-heading text-lg md:text-xl lg:text-xl font-medium mb-2">
                            {showingTranslateValue(product?.title)}
                        </h2>

                        {/* Price and Discount */}
                        <div className="flex items-center my-4">
                            <Price
                                price={price}
                                product={product}
                                currency={currency}
                                originalPrice={originalPrice}
                            />
                            <span className="ml-2">
                                <Discount slug product={product} discount={discount} />
                            </span>
                        </div>

                        {/* Bulk Pricing Display */}
                        {product?.bulkPricing && (product?.bulkPricing?.bulkRate1?.quantity > 0 || product?.bulkPricing?.bulkRate2?.quantity > 0) && (
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
                        )}

                        {/* Promo Bulk Pricing Display - Premium Unified Happy Hour Design */}
                        {product?.promoPricing && (product?.promoPricing?.singleUnit > 0 || product?.promoPricing?.bulkRate1?.quantity > 0 || product?.promoPricing?.bulkRate2?.quantity > 0) && (
                            <div className="bg-gradient-to-br from-[#025155] via-[#025155] to-[#018549] rounded-lg p-3 mb-4 space-y-2 border border-white/10 shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl -mr-12 -mt-12"></div>

                                <h4 className="relative z-10 text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                    <span className="text-[10px] font-black text-[#018549] bg-emerald-300 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(110,231,183,0.3)]">PROMO</span>
                                    <span className="tracking-wide uppercase text-xs font-black">Happy Hour (6pm - 9am)</span>
                                </h4>
                                {product?.promoPricing?.singleUnit > 0 && (
                                    <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-xs text-emerald-100 font-medium">Single Unit Price</span>
                                        <span className="text-sm font-black text-emerald-300">
                                            {currency}{product.promoPricing.singleUnit}/{product.unit || "unit"}
                                        </span>
                                    </div>
                                )}
                                {product?.promoPricing?.bulkRate1?.quantity > 0 && product?.promoPricing?.bulkRate1?.pricePerUnit > 0 && (
                                    <div className="relative z-10 flex items-center justify-between py-1 border-b border-white/5">
                                        <span className="text-xs text-emerald-100 font-medium">Buy {product.promoPricing.bulkRate1.quantity}+ {product.unit || "units"}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-emerald-300">
                                                {currency}{product.promoPricing.bulkRate1.pricePerUnit}/{product.unit || "unit"}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (!isPromoTime) return notifyError("Come at 6pm to get this offer!");
                                                    setItem(product.promoPricing.bulkRate1.quantity);
                                                }}
                                                className="text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors border border-white/10"
                                            >
                                                Add {product.promoPricing.bulkRate1.quantity}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {product?.promoPricing?.bulkRate2?.quantity > 0 && product?.promoPricing?.bulkRate2?.pricePerUnit > 0 && (
                                    <div className="relative z-10 flex items-center justify-between pt-1">
                                        <span className="text-xs text-emerald-100 font-medium">Buy {product.promoPricing.bulkRate2.quantity}+ {product.unit || "units"}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-emerald-300">
                                                {currency}{product.promoPricing.bulkRate2.pricePerUnit}/{product.unit || "unit"}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (!isPromoTime) return notifyError("Come at 6pm to get this offer!");
                                                    setItem(product.promoPricing.bulkRate2.quantity);
                                                }}
                                                className="text-[10px] font-black text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors border border-white/10"
                                            >
                                                Add {product.promoPricing.bulkRate2.quantity}
                                            </button>
                                        </div>
                                    </div>
                                )}
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

                        {/* Quantity and Add to Cart */}
                        <div className="flex items-center mt-4">
                            <div className="w-full grid lg:grid-cols-3 sm:grid-cols-3 gap-3">
                                <div className="group flex items-center justify-between rounded-md overflow-hidden flex-shrink-0 border border-gray-300">
                                    <button
                                        onClick={() => setItem(item - 1)}
                                        disabled={item === 1}
                                        className="flex items-center cursor-pointer justify-center py-2 px-4 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-e border-gray-300 hover:text-gray-500"
                                    >
                                        <FiMinus className="text-dark text-xl" />
                                    </button>
                                    <p className="font-semibold text-sm">{item}</p>
                                    <button
                                        onClick={() => setItem(item + 1)}
                                        disabled={product.quantity <= item}
                                        className="flex items-center cursor-pointer justify-center py-2 px-4 h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-s border-gray-300 hover:text-gray-500"
                                    >
                                        <FiPlus className="text-dark text-xl" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.quantity < 1}
                                    className="w-full text-sm flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none text-white py-2 px-4 hover:text-white bg-[#018549] hover:bg-[#016d3b]"
                                >
                                    <FiShoppingBag className="mr-2" />
                                    Add to cart
                                </button>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex items-center mt-6">
                            <Tags product={product} />
                        </div>
                    </div>
                </div>
            </div>
        </MainModal>
    );
};

export default dynamic(() => Promise.resolve(ProductModal), { ssr: false });
