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
      image: "/banner1.png",
      mobileImage: "/banner1.png",
    },
    {
      id: 2,
      title: "",
      info: "",
      buttonName: "",
      url: "/",
      image: "/banner2.png",
      mobileImage: "/banner2.png",
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

