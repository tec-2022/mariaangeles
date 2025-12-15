import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "../shared/LanguageContext";

export default function EventsSection() {
  const { t, language } = useLanguage();
  
  const { data: events = [] } = useQuery({
    queryKey: ['home-events'],
    queryFn: () => contentClient.entities.Event.filter({ is_upcoming: true }, 'date', 3)
  });

  const getTypeLabel = (type) => {
    const types = {
      keynote: t('events.types.keynote'),
      seminar: t('events.types.seminar'),
      workshop: t('events.types.workshop'),
      congress: t('events.types.congress'),
      forum: t('events.types.forum')
    };
    return types[type] || type;
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

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-12 rounded-full bg-[#D4AF37]"></div>
          <h2 className="text-4xl font-serif font-bold text-[#0A2540]">{t('home.upcomingEvents')}</h2>
        </div>
        <Link 
          to={createPageUrl("Events")} 
          className="text-[#D4AF37] hover:text-[#0A2540] font-medium text-sm transition-colors"
        >
          {t('common.viewAll')}
        </Link>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <Card 
            key={event.id}
            className="bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="badge-gold badge-elegant badge-shine">
                  {getTypeLabel(event.type)}
                </Badge>
                <span className="text-slate-400">•</span>
                <span className="text-sm text-slate-500">
                  {event.attendees > 0 ? `${event.attendees}+ ${language === 'es' ? 'asistentes' : 'attendees'}` : ''}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#0A2540] group-hover:text-[#D4AF37] transition-colors mb-4">
                {language === 'en' && event.title_en ? event.title_en : event.title}
              </h3>

              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs text-slate-400">{t('events.date')}</p>
                    <p className="font-medium">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs text-slate-400">{t('events.time')}</p>
                    <p className="font-medium">{event.time || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs text-slate-400">{t('events.location')}</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}