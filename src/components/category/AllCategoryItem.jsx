"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const AllCategoryItem = () => {
    const router = useRouter();

    const handleAllClick = () => {
        router.push("/search");
    };

    return (
        <div
            onClick={handleAllClick}
            className="flex flex-col items-center w-20 sm:w-24 md:w-28 cursor-pointer transition duration-200 ease-linear group-hover:-translate-y-1"
        >
            {/* Image Section - Rounded light bg like Blinkit */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform group-hover:scale-110 transition-transform duration-300"
                >
                    {/* Top Left Rounded Square */}
                    <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" stroke="#374151" strokeWidth="2" />
                    {/* Top Right Rounded Square */}
                    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" stroke="#374151" strokeWidth="2" />
                    {/* Bottom Left Rounded Square */}
                    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" stroke="#374151" strokeWidth="2" />
                    {/* Bottom Right Dot - Website Theme Color */}
                    <circle cx="17.25" cy="17.25" r="4.5" fill="#018549" />
                </svg>
            </div>
            {/* Text Below - No box, just text */}
            <h3 className="text-xs sm:text-sm text-gray-800 font-medium leading-tight line-clamp-2 text-center hover:text-primary-600">
                All
            </h3>
        </div>
    );
};

export default AllCategoryItem;
