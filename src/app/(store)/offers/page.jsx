import React from "react";

//internal imports
import Coupon from "@components/coupon/Coupon";
import PageHeader from "@components/header/PageHeader";
import { getStoreCustomizationSetting } from "@services/SettingServices";

export const metadata = {
  title: "Offers | Horeca1",
  description:
    "Discover the latest offers and discounts available at Horeca1.",
  keywords: ["offers", "discounts", "promotions", "sales"],
  // You can also add more advanced metadata here
  openGraph: {
    title: "Offers | Horeca1",
    description:
      "Discover the latest offers and discounts available at Horeca1.",
    url: "https://Horeca1-store-nine.vercel.app/offers",
    images: [
      {
        url: "https://Horeca1-store-nine.vercel.app/og-image.jpg",
        width: 800,
        height: 600,
        alt: "Offers Page",
      },
    ],
  },
};

const Offers = async () => {
  const { storeCustomizationSetting } = await getStoreCustomizationSetting();
  return (
    <div className="dark:bg-zinc-900">
      <PageHeader
        headerBg={storeCustomizationSetting?.offers?.header_bg}
        title={storeCustomizationSetting?.offers?.title}
      />

      <div className="mx-auto max-w-screen-2xl px-4 py-10 lg:py-20 sm:px-10">
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          <Coupon />
        </div>
      </div>
    </div>
  );
};

export default Offers;
