import React from "react";
import Link from "next/link";
import Image from "next/image";

//internal import
import CMSkeletonTwo from "@components/preloader/CMSkeleton";

const FooterTop = async ({ error, storeCustomizationSetting }) => {
  const home = storeCustomizationSetting?.home;

  return (
    <div
      id="downloadApp"
      className="bg-primary-500 py-16 lg:py-24 text-white"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            <CMSkeletonTwo
              count={1}
              height={40}
              error={error}
              loading={false}
              data={home?.daily_need_title || "Experience the fresh revolution"}
            />
          </h3>
          <p className="text-lg md:text-xl text-primary-100/80 leading-relaxed mb-10">
            <CMSkeletonTwo
              count={2}
              height={20}
              error={error}
              loading={false}
              data={home?.daily_need_description || "Join Horeca1 today and transform your restaurant's supply chain with efficiency and ease."}
            />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`${home?.daily_need_app_link || "#"}`}
              className="bg-white text-primary-800 px-8 py-4 rounded-full font-semibold transition-all hover:bg-primary-50 hover:scale-105 active:scale-95 shadow-xl"
              target="_blank"
              rel="noreferrer"
            >
              Get Started Now
            </Link>
            <div className="flex gap-4">
              <Link
                href={`${home?.daily_need_app_link || "#"}`}
                target="_blank"
                rel="noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="/app/app-store.svg"
                  alt="App Store"
                  className="h-12 w-auto invert brightness-0"
                />
              </Link>
              <Link
                href={`${home?.daily_need_google_link || "#"}`}
                target="_blank"
                rel="noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="/app/play-store.svg"
                  alt="Play Store"
                  className="h-12 w-auto invert brightness-0"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterTop;

