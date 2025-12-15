import React from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, BookOpen, GraduationCap, Mic } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "../shared/LanguageContext";

export default function StatsSection() {
  const { t } = useLanguage();
  
  // Fetch settings for manual stats
  const { data: settings = [], isLoading: loadingSettings } = useQuery({
    queryKey: ['home-stats'],
    queryFn: () => contentClient.entities.SiteSettings.filter({ category: 'stats' })
  });

  // Fetch real counts from database
  const { data: publications = [] } = useQuery({
    queryKey: ['publications-count'],
    queryFn: () => contentClient.entities.Publication.list()
  });

  const { data: episodes = [] } = useQuery({
    queryKey: ['episodes-count'],
    queryFn: () => contentClient.entities.PodcastEpisode.filter({ published: true })
  });

  const getSetting = (key) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || null;
  };

  const getTrend = (key) => {
    const setting = settings.find(s => s.key === `${key}_trend`);
    return setting?.value || null;
  };

  // Calculate thesis directed from settings
  const calculateThesisTotal = () => {
    const progressDoc = parseInt(getSetting('thesis_doctorate_progress') || '0');
    const progressMasters = parseInt(getSetting('thesis_masters_progress') || '0');
    const progressUndergrad = parseInt(getSetting('thesis_undergrad_progress') || '0');
    const gradDoc = parseInt(getSetting('thesis_doctorate_graduated') || '0');
    const gradMasters = parseInt(getSetting('thesis_masters_graduated') || '0');
    const gradUndergrad = parseInt(getSetting('thesis_undergrad_graduated') || '0');
    return progressDoc + progressMasters + progressUndergrad + gradDoc + gradMasters + gradUndergrad;
  };

  // Build stats with real data
  const allStats = [
    { 
      key: 'citations', 
      icon: TrendingUp, 
      label: t('stats.citations'),
      value: getSetting('citations'),
      trend: getTrend('citations')
    },
    { 
      key: 'publications', 
      icon: BookOpen, 
      label: t('stats.publications'),
      value: publications.length > 0 ? publications.length.toString() : getSetting('publications'),
      trend: getTrend('publications')
    },
    { 
      key: 'thesis_directed', 
      icon: GraduationCap, 
      label: t('stats.thesisDirected'),
      value: calculateThesisTotal() > 0 ? calculateThesisTotal().toString() : getSetting('thesis_directed'),
      trend: getTrend('thesis_directed')
    },
    { 
      key: 'podcast_listeners', 
      icon: Mic, 
      label: episodes.length > 0 ? t('stats.episodes') : t('stats.podcastListeners'),
      value: episodes.length > 0 ? episodes.length.toString() : getSetting('podcast_listeners'),
      trend: getTrend('podcast_listeners')
    },
  ];

  const stats = allStats.filter(stat => stat.value && stat.value !== '0');

  // No mostrar si está cargando o no hay stats
  if (loadingSettings || stats.length === 0) {
    return null;
  }

  // Ajustar grid según cantidad de stats
  const gridCols = stats.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' 
    : stats.length === 2 ? 'grid-cols-2 max-w-lg mx-auto'
    : stats.length === 3 ? 'grid-cols-3 max-w-3xl mx-auto'
    : 'grid-cols-2 md:grid-cols-4';

  return (
    <section className="relative -mt-20 z-10 mb-20" aria-label="Estadísticas">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`grid ${gridCols} gap-4`}>
          {stats.map((stat, index) => (
            <Card 
              key={stat.key}
              className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden bg-white dark:bg-slate-800"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6 text-center relative z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#db2777]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <stat.icon className="w-8 h-8 mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:text-[#be185d] text-[#db2777]" />
                <div className="text-3xl font-bold mb-1 text-[#4a4a4a] dark:text-white tabular-nums">{stat.value}</div>
                <div className="text-sm mb-2 text-slate-600 dark:text-slate-300">{stat.label}</div>
                {stat.trend && (
                  <Badge className="border-green-200 text-green-700 bg-green-50 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400 text-xs">
                    {stat.trend}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}