import React, { useEffect, lazy, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "../utils";
import SEOHead from "../components/shared/SEOHead";
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import SeasonalPopup from "../components/shared/SeasonalPopup";

// Lazy load non-critical sections
const NewsSection = lazy(() => import("../components/home/NewsSection"));
const EventsSection = lazy(() => import("../components/home/EventsSection"));
const PublicationsSection = lazy(() => import("../components/home/PublicationsSection"));
const CTASection = lazy(() => import("../components/home/CTASection"));

const SectionLoader = () => (
  <div className="py-12 flex justify-center">
    <div className="w-8 h-8 border-3 border-[#db2777] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function Home() {
  const { data: pageSettings = [], isLoading } = useQuery({
    queryKey: ['home-page-visibility'],
    queryFn: () => base44.entities.SiteSettings.filter({ category: 'pages' })
  });

  const isHomeHidden = pageSettings.find(s => s.key === 'show_home')?.value === 'false';

  // Order of pages to redirect to if Home is hidden
  const fallbackPages = ["About", "Events", "Publications", "Research", "Teaching", "Blog", "Podcast", "Gallery", "Contact"];
  
  useEffect(() => {
    if (!isLoading && isHomeHidden) {
      // Find first visible page
      for (const page of fallbackPages) {
        const setting = pageSettings.find(s => s.key === `show_${page.toLowerCase()}`);
        if (!setting || setting.value !== 'false') {
          window.location.href = createPageUrl(page);
          return;
        }
      }
    }
  }, [isLoading, isHomeHidden, pageSettings]);

  if (isLoading || isHomeHidden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#db2777] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SeasonalPopup />
      <SEOHead 
        title="Dra. María de los Ángeles Quezada Cisnero - Investigadora | Computación y Educación"
        description="Profesora Investigadora especializada en Computación y Educación, Interacción Humano-Computadora e Informática en Salud. Instituto Tecnológico de Tijuana, México."
        keywords="María de los Ángeles Quezada, investigación, computación, educación, interacción humano-computadora, informática en salud, TecNM, academia"
      />
      
      <HeroSection />
      <StatsSection />
      
      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-20">
        <Suspense fallback={<SectionLoader />}>
          <NewsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <EventsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PublicationsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CTASection />
        </Suspense>
      </div>
    </div>
  );
}