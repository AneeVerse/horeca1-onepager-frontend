"use client";

import { Input } from "@components/ui/input";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSetting } from "@context/SettingContext";
import SearchSuggestions from "@components/search/SearchSuggestions";
import { getSearchSuggestions } from "@services/SearchServices";
import useUtilsFunction from "@hooks/useUtilsFunction";

const SearchInput = () => {
  const router = useRouter();
  const { globalSetting } = useSetting();
  const { showingTranslateValue } = useUtilsFunction();
  const currency = globalSetting?.default_currency || "₹";
  
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (query && query.trim().length >= 1) {
        setIsLoading(true);
        try {
          const results = await getSearchSuggestions(query, 5);
          setSuggestions(results);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (value.trim().length >= 1) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    if (searchText) {
      router.push(`/search?query=${encodeURIComponent(searchText)}`, { scroll: true });
      setSearchText("");
      setSuggestions([]);
    } else {
      router.push(`/`, { scroll: true });
      setSearchText("");
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch(e);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          const product = suggestions[selectedIndex];
          const productName = showingTranslateValue(product?.title) || product?.title || "";
          if (productName) {
            router.push(`/search?query=${encodeURIComponent(productName)}`, { scroll: true });
          }
          setShowSuggestions(false);
          setSearchText("");
          setSuggestions([]);
        } else {
          handleSearch(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSuggestionSelect = () => {
    setShowSuggestions(false);
    setSearchText("");
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow click events on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSearch}
        className="relative pr-12 md:pr-14 bg-white overflow-visible shadow-sm rounded-md w-full"
      >
        <label className="flex items-center py-0.5">
          <Input
            ref={inputRef}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={searchText}
            className="form-input w-full pl-5 appearance-none transition ease-in-out text-sm text-gray-700 font-sans rounded-md h-9 duration-200 bg-white focus:ring-0 outline-none border-none focus:outline-none"
            placeholder="Search for products"
          />
        </label>
        <button
          aria-label="Search"
          type="submit"
          className="outline-none text-xl text-gray-400 absolute top-0 right-0 end-0 w-12 md:w-14 h-full flex items-center justify-center transition duration-200 ease-in-out hover:text-heading focus:outline-none z-10"
        >
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </button>
      </form>
      
      <SearchSuggestions
        suggestions={suggestions}
        isOpen={showSuggestions && suggestions.length > 0}
        onClose={() => setShowSuggestions(false)}
        onSelect={handleSuggestionSelect}
        selectedIndex={selectedIndex}
        currency={currency}
      />
    </div>
  );
};

export default SearchInput;

