
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { 
  Menu, 
  X, 
  Moon, 
  Sun, 
  Globe,
  
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { LanguageProvider, useLanguage } from "@/components/shared/LanguageContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import SocialBubble from "@/components/shared/SocialBubble";
import CookieConsent from "@/components/shared/CookieConsent";
import ScrollToTop from "@/components/shared/ScrollToTop";
import FoldedCorner from "@/components/shared/FoldedCorner";
import SeasonalEffects from "@/components/shared/SeasonalEffects";

function LayoutContent({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [darkMode, setDarkMode] = useState(false);
      const { language, setLanguage, t } = useLanguage();

      // Fetch page visibility settings
      const { data: pageSettings = [] } = useQuery({
        queryKey: ['page-visibility'],
        queryFn: () => base44.entities.SiteSettings.filter({ category: 'pages' })
      });

      // Fetch seasonal theme
      const { data: themeSettings = [] } = useQuery({
        queryKey: ['seasonal-theme-layout'],
        queryFn: () => base44.entities.SiteSettings.filter({ key: 'seasonal_theme' })
      });
      const seasonalTheme = themeSettings.find(s => s.key === 'seasonal_theme')?.value || 'none';

      const isPageVisible = (key) => {
        if (!key) return true;
        const setting = pageSettings.find(s => s.key === key);
        return !setting || setting.value === 'true';
      };

  // Admin page has its own layout
  if (currentPageName === 'Admin') {
    return <>{children}</>;
  }

  const allNavItems = [
        { name: t('nav.home'), page: "Home", key: "show_home" },
        { name: t('nav.about'), page: "About", key: "show_about" },
        { name: t('nav.events'), page: "Events", key: "show_events" },
        { name: t('nav.publications'), page: "Publications", key: "show_publications" },
        { name: t('nav.research'), page: "Research", key: "show_research" },
        { name: t('nav.teaching'), page: "Teaching", key: "show_teaching" },
        { name: t('nav.blog'), page: "Blog", key: "show_blog" },
        { name: t('nav.podcast'), page: "Podcast", key: "show_podcast" },
        { name: t('nav.gallery'), page: "Gallery", key: "show_gallery" },
        { name: t('nav.contact'), page: "Contact", key: "show_contact" },
      ];

      const navItems = allNavItems.filter(item => isPageVisible(item.key));

      // Get the first visible page to use as home
      const homePage = navItems.length > 0 ? navItems[0].page : "Home";

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <style>{`
        :root {
                        --bg-primary: #fdf2f8;
                        --bg-secondary: #ffffff;
                        --text-primary: #4a4a4a;
                        --text-secondary: #6b7280;
                        --border-color: #e5e7eb;
                        --accent-primary: #db2777;
                        --accent-secondary: #9ca3af;
                      }
        
        .dark {
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --border-color: #334155;
        }
        
        .dark {
                        background: linear-gradient(to bottom right, #374151, #4b5563);
                      }

                      .dark .bg-white {
                        background-color: #374151 !important;
                      }

                      .dark .bg-white\\/90 {
                        background-color: rgba(55, 65, 81, 0.95) !important;
                      }

                      .dark .text-\\[\\#4a4a4a\\] {
                        color: #f1f5f9 !important;
                      }

                      .dark .text-\\[\\#0A2540\\] {
                        color: #f1f5f9 !important;
                      }

                      .dark .text-slate-600 {
                        color: #d1d5db !important;
                      }

                      .dark .text-slate-500 {
                        color: #d1d5db !important;
                      }

                      .dark .text-slate-700 {
                        color: #e5e7eb !important;
                      }

                      .dark .border-slate-200 {
                        border-color: #4b5563 !important;
                      }

                      .dark .border-slate-200\\/50 {
                        border-color: rgba(75, 85, 99, 0.5) !important;
                      }

                      .dark .hover\\:bg-slate-100:hover {
                        background-color: #4b5563 !important;
                      }

                      .dark .hover\\:bg-slate-50:hover {
                        background-color: #4b5563 !important;
                      }

                      .dark .bg-slate-100 {
                        background-color: #4b5563 !important;
                      }

                      .dark .bg-slate-50 {
                        background-color: #374151 !important;
                      }

                      .dark .shadow-sm {
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3) !important;
                      }

                      .dark .shadow-lg {
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4) !important;
                      }

                      .dark .shadow-xl {
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4) !important;
                      }

                      .dark h1, .dark h2, .dark h3, .dark h4 {
                        color: #f1f5f9;
                      }

                      .dark p {
                        color: #e5e7eb;
                      }

                      .dark .bg-gradient-to-br {
                        background: linear-gradient(to bottom right, #374151, #4b5563) !important;
                      }

                      .dark .text-\\[\\#db2777\\] {
                        color: #f472b6 !important;
                      }

                      .dark .bg-\\[\\#db2777\\] {
                        background-color: #ec4899 !important;
                      }

                      .dark .border-\\[\\#db2777\\] {
                        border-color: #ec4899 !important;
                      }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
        
        .font-serif {
                    font-family: 'Playfair Display', serif;
                    letter-spacing: -0.01em;
                  }

                  body {
                    font-family: 'Inter', sans-serif;
                    letter-spacing: 0.01em;
                  }

                  h1, h2, h3 {
                    letter-spacing: -0.02em;
                  }

                  .text-elegant {
                    font-family: 'Cormorant Garamond', serif;
                  }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>

      {/* Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${darkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-xl border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo */}
            <Link to={createPageUrl(homePage)} className="flex items-center gap-3 group">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#db2777] via-[#ec4899] to-[#db2777] flex items-center justify-center text-white font-serif font-bold text-base shadow-lg shadow-[#db2777]/25 ring-2 ring-[#9ca3af]/30 group-hover:ring-[#db2777]/60 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#db2777]/20">
                                    MQ
                                  </div>
                {/* Seasonal logo decorations */}
                {seasonalTheme === 'christmas' && (
                  <span className="absolute -top-2 -right-1 text-lg">🎅</span>
                )}
                {seasonalTheme === 'halloween' && (
                  <span className="absolute -top-1 -right-1 text-base">🎃</span>
                )}
                {seasonalTheme === 'valentines' && (
                  <span className="absolute -top-1 -right-1 text-base">💕</span>
                )}
                {seasonalTheme === 'spring' && (
                  <span className="absolute -top-1 -right-1 text-base">🌸</span>
                )}
                {seasonalTheme === 'independence' && (
                  <div className="absolute -top-1 -right-1 flex gap-[1px]">
                    <div className="w-1.5 h-3 bg-green-600 rounded-l-sm"></div>
                    <div className="w-1.5 h-3 bg-white"></div>
                    <div className="w-1.5 h-3 bg-red-600 rounded-r-sm"></div>
                  </div>
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className={`font-serif font-bold text-lg leading-tight tracking-tight ${darkMode ? 'text-white' : 'text-[#4a4a4a]'} group-hover:text-[#db2777] transition-colors`}>Dra. María de los Ángeles Quezada</h1>
                                      <p className={`text-xs font-medium tracking-wide uppercase ${darkMode ? 'text-[#db2777]/80' : 'text-[#db2777]'}`}>{language === 'es' ? 'Profesora Investigadora' : 'Research Professor'}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <div className={`flex items-center gap-1 px-2 py-1.5 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100/80'}`}>
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`relative px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                                                currentPageName === item.page
                                                  ? `${darkMode ? 'bg-[#db2777] text-white shadow-lg' : 'bg-white text-[#db2777] shadow-md'}`
                                                  : `${darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' : 'text-slate-600 hover:text-[#db2777] hover:bg-white/60'}`
                                              }`}
                  >
                    {item.name}
                    {currentPageName === item.page && (
                                                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[80%] h-[3px] bg-gradient-to-r from-[#db2777] via-[#ec4899] to-[#db2777] rounded-full shadow-[0_0_8px_rgba(219,39,119,0.6)]"></span>
                                              )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-1">
              <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100/80'}`}>
                <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDarkMode(!darkMode)}
                                        className={`rounded-lg h-9 w-9 ${darkMode ? 'text-slate-300 hover:text-[#db2777] hover:bg-slate-700/50' : 'text-slate-600 hover:text-[#db2777] hover:bg-white'} transition-all`}
                                      >
                                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                                        className={`rounded-lg h-9 px-3 font-semibold ${darkMode ? 'text-slate-300 hover:text-[#db2777] hover:bg-slate-700/50' : 'text-slate-600 hover:text-[#db2777] hover:bg-white'} transition-all`}
                                      >
                  <Globe className="w-4 h-4 mr-1.5" />
                  {language === 'es' ? 'EN' : 'ES'}
                </Button>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className={`lg:hidden ml-2 rounded-xl h-10 w-10 ${darkMode ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-100/80 text-slate-600'}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className={`lg:hidden py-4 border-t ${darkMode ? 'border-slate-700/50' : 'border-slate-200/60'} animate-fade-in`}>
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`px-4 py-3.5 text-sm font-medium rounded-xl transition-all animate-fade-in-up ${
                                                currentPageName === item.page
                                                  ? `${darkMode ? 'bg-[#db2777] text-white' : 'bg-gradient-to-r from-[#db2777] to-[#ec4899] text-white'} shadow-lg`
                                                  : `${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`
                                              }`}
                  >
                    <span className="flex items-center justify-between">
                      {item.name}
                      {currentPageName === item.page && (
                                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                                  )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      <ScrollToTop />
        <main>{children}</main>

      {/* Social Bubble */}
      <SocialBubble />



      {/* Cookie Consent */}
      <CookieConsent />

      {/* Seasonal Effects */}
      <SeasonalEffects />

      {/* Footer */}
                          <footer className="relative bg-gradient-to-br from-[#4a4a4a] via-[#6b7280] to-[#4a4a4a] text-white py-16 mt-20 border-t-4 border-[#db2777]">
                    <FoldedCorner />
                    <div className="max-w-7xl mx-auto px-6">
                      <div className="grid md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center font-serif font-bold text-sm ring-1 ring-[#db2777]/30">
                                                  MQ
                                                </div>
                            <div>
                              <h3 className="font-serif font-bold text-lg">Dra. María de los Ángeles Quezada</h3>
                              <p className="text-sm text-slate-300">{language === 'es' ? 'Profesora Investigadora' : 'Research Professor'}</p>
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm max-w-md">
                            {language === 'es' 
                              ? 'Investigación enfocada en computación y educación, interacción humano-computadora e informática en salud.'
                              : 'Research focused on computers and education, human-computer interaction, and health informatics.'}
                          </p>
                        </div>
            
            <div>
                                <h4 className="font-semibold mb-4 text-[#db2777]">{t('footer.quickLinks')}</h4>
                                <div className="flex flex-col gap-2">
                                  <Link to={createPageUrl("Publications")} className="text-slate-300 hover:text-white text-sm">{t('nav.publications')}</Link>
                                  <Link to={createPageUrl("Research")} className="text-slate-300 hover:text-white text-sm">{t('nav.research')}</Link>
                                  <Link to={createPageUrl("Teaching")} className="text-slate-300 hover:text-white text-sm">{t('nav.teaching')}</Link>
                                  <Link to={createPageUrl("Contact")} className="text-slate-300 hover:text-white text-sm">{t('nav.contact')}</Link>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-4 text-[#db2777]">{t('footer.contact')}</h4>
                                <div className="flex flex-col gap-2 text-slate-300 text-sm">
                                  <p>angeles.quezada@tectijuana.edu.mx</p>
                                  <p>+52 664 607 8400</p>
                                  <p>Instituto Tecnológico de Tijuana, B.C., México</p>
                                </div>
                              </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-300">
                            <p>© {new Date().getFullYear()} Dra. María de los Ángeles Quezada Cisnero. {t('footer.allRightsReserved')}</p>
            <div className="flex gap-4">
              <Link to={createPageUrl("Privacy")} className="hover:text-white transition-colors">
                {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
              </Link>
              <Link to={createPageUrl("Terms")} className="hover:text-white transition-colors">
                {language === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </LanguageProvider>
  );
}
