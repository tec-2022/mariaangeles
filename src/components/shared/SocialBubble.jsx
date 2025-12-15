import React, { useState, useEffect } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { Share2, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";

// Load Font Awesome and Academicons
const loadIcons = () => {
  if (!document.getElementById('font-awesome-css')) {
    const faLink = document.createElement('link');
    faLink.id = 'font-awesome-css';
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    document.head.appendChild(faLink);
  }
  if (!document.getElementById('academicons-css')) {
    const aiLink = document.createElement('link');
    aiLink.id = 'academicons-css';
    aiLink.rel = 'stylesheet';
    aiLink.href = 'https://cdn.jsdelivr.net/gh/jpswalsh/academicons@1/css/academicons.min.css';
    document.head.appendChild(aiLink);
  }
};

const PLATFORM_CONFIG = {
  linkedin: { icon: "fa-brands fa-linkedin-in", bgClass: "bg-gradient-to-br from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-200", iconClass: "text-sky-700" },
  researchgate: { icon: "ai ai-researchgate", bgClass: "bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200", iconClass: "text-teal-600" },
  google_scholar: { icon: "ai ai-google-scholar", bgClass: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200", iconClass: "text-blue-600" },
  orcid: { icon: "ai ai-orcid", bgClass: "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200", iconClass: "text-green-600" },
  academia: { icon: "ai ai-academia", bgClass: "bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200", iconClass: "text-amber-700" },
  scopus: { icon: "ai ai-scopus", bgClass: "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200", iconClass: "text-orange-600" },
  web_of_science: { icon: "ai ai-clarivate", bgClass: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200", iconClass: "text-purple-600" },
  youtube: { icon: "fa-brands fa-youtube", bgClass: "bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200", iconClass: "text-red-600" },
  twitter: { icon: "fa-brands fa-x-twitter", bgClass: "bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200", iconClass: "text-slate-700" },
  facebook: { icon: "fa-brands fa-facebook-f", bgClass: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200", iconClass: "text-blue-600" },
  instagram: { icon: "fa-brands fa-instagram", bgClass: "bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200", iconClass: "text-pink-600" }
};

export default function SocialBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    loadIcons();
  }, []);

  // Fetch social links from database
  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-links'],
    queryFn: () => contentClient.entities.SocialLink.filter({ active: true }, 'order')
  });

  // Don't render if no social links
  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-6 w-80 animate-fade-in-up border border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#4a4a4a]">{t('social.connect')}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wide">{t('social.socialNetworks')}</p>
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          {/* Social Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {socialLinks.map((link) => {
              const config = PLATFORM_CONFIG[link.platform] || { 
                icon: "fa-solid fa-link", 
                bgClass: "bg-gradient-to-br from-slate-50 to-slate-100", 
                iconClass: "text-slate-600" 
              };
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.platform}
                  className={`w-14 h-14 rounded-xl ${config.bgClass} flex items-center justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                >
                  <i className={`${config.icon} text-lg ${config.iconClass}`}></i>
                </a>
              );
            })}
          </div>

          {/* Footer text */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('social.clickToHide')}</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
            </div>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl ${
          isOpen 
            ? 'bg-slate-700 hover:bg-slate-800' 
            : 'bg-[#db2777] hover:bg-[#be185d]'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Share2 className="w-6 h-6 text-white" />
            {socialLinks.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#4a4a4a] rounded-full text-white text-xs flex items-center justify-center font-bold">
                {socialLinks.length}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}