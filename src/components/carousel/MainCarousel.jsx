//internal import

import CarouselCard from "@components/carousel/CarouselCard";
import { getStoreCustomizationSetting } from "@services/SettingServices";
import { getBanners } from "@services/BannerService";

const MainCarousel = async () => {
  const { storeCustomizationSetting } = await getStoreCustomizationSetting();
  
  // Fetch banners from API
  const banners = await getBanners();

  // Transform banners to sliderData format
  const sliderData = banners.map((banner, index) => ({
    id: banner._id || index + 1,
    title: "",
    info: "",
    buttonName: "",
    url: "/",
    image: banner.image || "",
    mobileImage: banner.mobileImage || banner.image || "",
  }));

  // If no banners, return null or empty state
  if (sliderData.length === 0) {
    return null;
  }

  return (
    <>
      <CarouselCard
        sliderData={sliderData}
        storeCustomizationSetting={storeCustomizationSetting}
      />
    </>
  );
};

export default MainCarousel;

