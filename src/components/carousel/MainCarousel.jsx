//internal import

import CarouselCard from "@components/carousel/CarouselCard";
import { getStoreCustomizationSetting } from "@services/SettingServices";

const MainCarousel = async () => {
  const { storeCustomizationSetting } = await getStoreCustomizationSetting();

  const sliderData = [
    {
      id: 1,
      title: "",
      info: "",
      buttonName: "",
      url: "/",
      image: "/001a.png",
      mobileImage: "/001a.png",
    },
    {
      id: 2,
      title: "",
      info: "",
      buttonName: "",
      url: "/",
      image: "/001b.png",
      mobileImage: "/001b.png",
    },
  ];

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

