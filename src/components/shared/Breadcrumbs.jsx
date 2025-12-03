import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function Breadcrumbs({ items }) {
  const { t } = useLanguage();
  
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
      <Link 
        to={createPageUrl("Home")} 
        className="flex items-center gap-1 hover:text-[#0A2540] transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-[#0A2540] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#0A2540] font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}