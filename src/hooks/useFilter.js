import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const useFilter = (data, filters = {}) => {
  const [pending, setPending] = useState([]);
  const [processing, setProcessing] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [sortedField, setSortedField] = useState(filters.sortBy || "");
  const router = useRouter();

  const productData = useMemo(() => {
    let services = Array.isArray(data) ? [...data] : [];
    
    //filter user order
    if (router.pathname === "/user/dashboard") {
      const orderPending = services?.filter(
        (statusP) => statusP.status === "Pending"
      );
      setPending(orderPending);

      const orderProcessing = services?.filter(
        (statusO) => statusO.status === "Processing"
      );
      setProcessing(orderProcessing);

      const orderDelivered = services?.filter(
        (statusD) => statusD.status === "Delivered"
      );
      setDelivered(orderDelivered);
    }

    // Apply price range filter
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin);
      if (!isNaN(minPrice)) {
        services = services.filter((item) => {
          const price = item?.prices?.price || item?.price || 0;
          return price >= minPrice;
        });
      }
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax);
      if (!isNaN(maxPrice)) {
        services = services.filter((item) => {
          const price = item?.prices?.price || item?.price || 0;
          return price <= maxPrice;
        });
      }
    }

    // Apply category filter
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      services = services.filter((item) => {
        const itemCategories = item?.categories || [];
        const itemCategory = item?.category?._id || item?.category;
        return (
          filters.selectedCategories.some(
            (catId) =>
              itemCategories.includes(catId) ||
              itemCategory === catId ||
              itemCategories.some((cat) => cat._id === catId || cat === catId)
          )
        );
      });
    }

    // Apply brand filter
    if (filters.selectedBrands && filters.selectedBrands.length > 0) {
      services = services.filter((item) => {
        const itemBrand = item?.brand || "";
        return filters.selectedBrands.includes(itemBrand);
      });
    }

    // Apply stock status filter
    if (filters.inStock !== null && filters.inStock !== undefined) {
      services = services.filter((item) => {
        const stock = item?.stock || item?.quantity || 0;
        return filters.inStock ? stock > 0 : stock <= 0;
      });
    }

    // Apply sorting
    const sortField = filters.sortBy || sortedField;
    
    if (sortField === "Low" || sortField === "price-low") {
      services = services?.sort(
        (a, b) => (a.prices?.price || a.price || 0) - (b.prices?.price || b.price || 0)
      );
    } else if (sortField === "High" || sortField === "price-high") {
      services = services?.sort(
        (a, b) => (b.prices?.price || b.price || 0) - (a.prices?.price || a.price || 0)
      );
    } else if (sortField === "name-asc") {
      services = services?.sort((a, b) => {
        const nameA = (a.title?.en || a.title || "").toLowerCase();
        const nameB = (b.title?.en || b.title || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortField === "name-desc") {
      services = services?.sort((a, b) => {
        const nameA = (a.title?.en || a.title || "").toLowerCase();
        const nameB = (b.title?.en || b.title || "").toLowerCase();
        return nameB.localeCompare(nameA);
      });
    } else if (sortField === "newest") {
      services = services?.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    } else if (sortField === "oldest") {
      services = services?.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
    }

    return services;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedField, data, filters.priceMin, filters.priceMax, filters.selectedCategories, filters.selectedBrands, filters.inStock, filters.sortBy]);

  return {
    productData,
    pending,
    processing,
    delivered,
    setSortedField,
  };
};

export default useFilter;

