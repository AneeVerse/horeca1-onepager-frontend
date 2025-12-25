import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import FooterTop from "@layout/footer/FooterTop";
import FeatureCard from "@components/feature-card/FeatureCard";
import {
  getStoreCustomizationSetting,
  getGlobalSetting,
} from "@services/SettingServices";

export default async function StoreLayout({ children }) {
  const globalResult = await getGlobalSetting();
  const customizationResult = await getStoreCustomizationSetting();

  const globalSetting = globalResult.globalSetting || {};
  const storeCustomizationSetting = customizationResult.storeCustomizationSetting || {};

  return (
    <>
      <Navbar
        globalSetting={globalSetting}
        storeCustomization={storeCustomizationSetting}
      />
      <main className="bg-gray-50 dark:bg-zinc-900 z-10">
        {children}
      </main>
      <div className="w-full">
        <Footer
          error={customizationResult.error}
          storeCustomizationSetting={storeCustomizationSetting}
        />
      </div>
    </>
  );
}






