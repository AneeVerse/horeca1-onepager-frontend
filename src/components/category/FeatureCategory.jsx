import Image from "next/image";

//internal import
import CMSkeletonTwo from "@components/preloader/CMSkeleton";
import { getShowingCategory } from "@services/CategoryService";
import CategoryCardItem from "@components/category/CategoryCardItem";
import AllCategoryItem from "@components/category/AllCategoryItem";

const FeatureCategory = async () => {
  const { categories, error } = await getShowingCategory();

  return (
    <>
      {error ? (
        <CMSkeletonTwo count={10} height={20} error={error} loading={false} />
      ) : (
        <div className="flex justify-center w-full">
          <ul className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4">
            <li className="group flex-shrink-0">
              <AllCategoryItem />
            </li>
            {(categories[0]?.children || []).map((category, i) => (
              <li className="group flex-shrink-0" key={i + 1}>
                <CategoryCardItem category={category} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default FeatureCategory;

