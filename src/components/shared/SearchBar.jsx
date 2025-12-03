import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageContext";
import { trackSearch } from "./Analytics";

export default function SearchBar({ onSearch, placeholder, className = "" }) {
  const [query, setQuery] = useState("");
  const { language } = useLanguage();

  const defaultPlaceholder = language === 'es' ? "Buscar..." : "Search...";

  const handleSearch = (value) => {
    setQuery(value);
    onSearch(value);
    if (value.length > 2) {
      trackSearch(value, -1); // -1 indicates we don't know results count yet
    }
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        type="text"
        placeholder={placeholder || defaultPlaceholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10 caret-[#D4AF37]"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={clearSearch}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}