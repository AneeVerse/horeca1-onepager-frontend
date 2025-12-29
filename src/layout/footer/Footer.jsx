import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

//internal imports

import useUtilsFunction from "@hooks/useUtilsFunction";
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import { getUserServerSession } from "@lib/auth-server";

// Dynamically import FooterContent (client component)
const FooterContent = dynamic(() => import("@components/footer/FooterContent"));

const Footer = async ({ error, storeCustomizationSetting }) => {
  const footer = storeCustomizationSetting?.footer;

  return (
    <div className="bg-gradient-to-b from-primary-50 to-white pb-20 lg:pb-8">
      {/* Hero Logo Section */}
      <div className="bg-primary-500 py-12 lg:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-10 flex flex-col items-center justify-center text-center">
          <div className="relative w-48 md:w-64 lg:w-full lg:max-w-md">
            <img
              src="https://res.cloudinary.com/dezs8ma9n/image/upload/v1766484997/horecaLogo_hirtnv.png"
              alt="Horeca1 Large"
              className="w-full h-auto object-contain brightness-0 invert opacity-90"
            />
          </div>
          <p className="text-white/80 text-xs md:text-sm tracking-[0.15em] md:tracking-[0.25em] uppercase mt-3 lg:mt-4 font-medium">Hospitality Supplies Made Easy</p>
        </div>
      </div>

      {/* Footer Content - conditionally hidden on home page */}
      <FooterContent storeCustomizationSetting={storeCustomizationSetting} />
    </div>
  );
};

export default Footer;
