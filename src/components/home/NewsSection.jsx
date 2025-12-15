import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Mic, Award, Calendar, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "../shared/LanguageContext";

export default function NewsSection() {
  const { t, language } = useLanguage();
  
  const { data: news = [] } = useQuery({
    queryKey: ['home-news'],
    queryFn: () => contentClient.entities.NewsItem.filter({ published: true }, '-date', 3)
  });

  const getIcon = (type) => {
    switch (type) {
      case 'publication': return BookOpen;
      case 'episode': return Mic;
      case 'recognition': return Award;
      case 'event': return Calendar;
      default: return BookOpen;
    }
  };

  const getBadge = (type) => {
    switch (type) {
      case 'publication': return { label: t('news.newPublication'), color: "bg-blue-100 text-blue-800 border-blue-200" };
      case 'episode': return { label: t('news.newEpisode'), color: "bg-purple-100 text-purple-800 border-purple-200" };
      case 'recognition': return { label: t('news.recognition'), color: "bg-amber-100 text-amber-800 border-amber-200" };
      case 'event': return { label: language === 'es' ? 'Evento' : 'Event', color: "bg-green-100 text-green-800 border-green-200" };
      default: return { label: t('news.newPublication'), color: "bg-blue-100 text-blue-800 border-blue-200" };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Obtener la página destino según el tipo de noticia
  const getDestinationPage = (item) => {
    switch (item.type) {
      case 'publication': return item.link || createPageUrl("Publications");
      case 'episode': return item.link || createPageUrl("Podcast");
      case 'recognition': return item.link || createPageUrl("About");
      case 'event': return item.link || createPageUrl("Events");
      default: return item.link || createPageUrl("Blog");
    }
  };

  if (news.length === 0) return null;

  return (
    <section aria-labelledby="news-heading">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#f4d03f]"></div>
          <h2 id="news-heading" className="text-4xl font-serif font-bold text-[#0A2540]">{t('home.latestNews')}</h2>
        </div>
        <span className="hidden md:inline-flex bg-green-100 text-green-800 border-green-200 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
          {t('common.updatedToday')}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {news.map((item, index) => {
          const Icon = getIcon(item.type);
          const badge = getBadge(item.type);
          const destination = getDestinationPage(item);
          const isExternal = item.link && item.link.startsWith('http');
          
          const CardContent = (
            <article className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-[#D4AF37]" aria-hidden="true" />
                </div>
                <span className={`${badge.color} inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`}>
                  {badge.label}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3 line-clamp-2 text-[#0A2540] group-hover:text-[#D4AF37] transition-colors">
                {language === 'en' && item.title_en ? item.title_en : item.title}
              </h3>
              <div className="flex items-center justify-between">
                <time className="text-sm flex items-center gap-2 text-slate-500" dateTime={item.date}>
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {formatDate(item.date)}
                </time>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </div>
            </article>
          );

          return isExternal ? (
            <a 
              key={item.id}
              href={destination}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card 
                className="bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-transparent hover:border-[#D4AF37]/20 h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {CardContent}
              </Card>
            </a>
          ) : (
            <Link key={item.id} to={destination}>
              <Card 
                className="bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-transparent hover:border-[#D4AF37]/20 h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {CardContent}
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}