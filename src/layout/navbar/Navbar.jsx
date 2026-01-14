import Link from "next/link";

//internal imports
import TopNavbar from "./TopNavbar";
import NavbarPromo from "@layout/navbar/NavbarPromo";
import SearchInput from "@components/navbar/SearchInput";
import NotifyIcon from "@components/navbar/NotifyIcon";
import ProfileDropDown from "@components/navbar/ProfileDropDown";
import { getShowingLanguage } from "@services/SettingServices";
import { getShowingCategory } from "@services/CategoryService";

const Navbar = async ({ globalSetting, storeCustomization }) => {
  const { languages } = await getShowingLanguage();
  const { categories, error: categoryError } = await getShowingCategory();

  const currency = globalSetting?.default_currency || "₹";

  return (
    // Navbar.jsx
    <div className="sticky z-20 top-0 w-full">
      {/* navbar top section */}

      <TopNavbar storeCustomization={storeCustomization} />

      <header className="bg-primary-500 shadow">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-10 lg:divide-y lg:divide-gray-200">
          <div className="relative flex h-20 justify-between">
            <div className="relative z-50 hidden sm:flex px-2 lg:px-0">
              <Link href="/" className="flex flex-shrink-0 items-center">
                <img
                  className="h-8 w-auto filter brightness-0 invert"
                  src="https://res.cloudinary.com/dezs8ma9n/image/upload/v1766484997/horecaLogo_hirtnv.png"
                  alt="horeca1"
                />
              </Link>
            </div>

            {/* search input section */}
            <div className="min-w-0 flex-1 md:px-8 lg:px-10 xl:col-span-6">
              <div className="flex items-center px-6 py-4 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                <div className="w-full">
                  <SearchInput />
                </div>
                {/* Mobile cart icon - show after search on mobile */}
                <div className="sm:hidden ml-2 flex-shrink-0 -mr-2">
                  <NotifyIcon currency={currency} mobileOnly />
                </div>
              </div>
            </div>

            {/* notification icons - desktop only */}
            <div className="lg:relative lg:z-10 sm:flex sm:items-center hidden">
              <NotifyIcon currency={currency} />

              {/* Profile dropdown */}
              <div className="relative ml-4 flex-shrink-0">
                <ProfileDropDown />
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* navbar bottom - NavbarPromo will check pathname and hide on home page */}
      <NavbarPromo
        languages={languages}
        categories={categories}
        categoryError={categoryError}
      />
    </div>
  );
};

export default Navbar;

