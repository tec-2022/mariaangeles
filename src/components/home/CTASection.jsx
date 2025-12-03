import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../shared/LanguageContext";

export default function CTASection() {
  const { t } = useLanguage();
  
  return (
    <section 
      className="relative bg-gradient-to-br from-[#4a4a4a] via-[#6b7280] to-[#4a4a4a] rounded-3xl p-8 md:p-12 text-center overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ec4899] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative">
        <h2 id="cta-heading" className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
          {t('home.interestedInCollaborating')}
        </h2>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          {t('home.collaborationText')}
        </p>
        <Link to={createPageUrl("Contact")}>
          <Button className="bg-[#db2777] hover:bg-[#be185d] text-white px-8 h-12 shadow-xl hover:shadow-2xl hover:shadow-[#db2777]/20 transition-all duration-300 group">
            {t('home.contactMe')}
            <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Button>
        </Link>
      </div>
    </section>
  );
}