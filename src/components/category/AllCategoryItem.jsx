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
                <Image
                    src="/product-header.png"
                    alt="All"
                    width={100}
                    height={100}
                    className="object-contain p-1"
                />
            </div>
            {/* Text Below - No box, just text */}
            <h3 className="text-xs sm:text-sm text-gray-800 font-medium leading-tight line-clamp-2 text-center hover:text-primary-600">
                All
            </h3>
        </div>
    );
};

export default AllCategoryItem;
