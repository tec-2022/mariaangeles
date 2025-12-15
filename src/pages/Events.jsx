import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageHeader from "../components/shared/PageHeader";
import Pagination from "../components/shared/Pagination";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import { useLanguage } from "../components/shared/LanguageContext";

export default function Events() {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Fetch events from database
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-page'],
    queryFn: () => contentClient.entities.Event.list('-date')
  });

  const upcomingEvents = events.filter(e => e.is_upcoming);
  const pastEvents = events.filter(e => !e.is_upcoming);

  const totalPages = Math.ceil(pastEvents.length / itemsPerPage);
  const paginatedPastEvents = pastEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader icon={Calendar} title={t('events.title')} description={t('events.description')} />
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#db2777]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={Calendar}
        title={t('events.title')}
        description={t('events.description')}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <Breadcrumbs items={[{ label: t('nav.events') }]} />
        
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-[#db2777]"></div>
              <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{t('events.upcomingEvents')}</h2>
            </div>

            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="bg-white p-6 hover:shadow-xl transition-all">
                  <Badge className="badge-gold badge-elegant badge-shine mb-4">
                    {getTypeLabel(event.type)}
                  </Badge>
                  
                  <h3 className="text-2xl font-bold text-[#4a4a4a] mb-3">
                    {language === 'en' && event.title_en ? event.title_en : event.title}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {language === 'en' && event.description_en ? event.description_en : event.description}
                  </p>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-[#db2777]" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{t('events.date')}</p>
                        <p className="font-semibold text-[#4a4a4a]">{formatDate(event.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Clock className="w-5 h-5 text-[#db2777]" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{t('events.time')}</p>
                        <p className="font-semibold text-[#4a4a4a]">{event.time || '-'}</p>
                      </div>
                    </div>
                    {event.attendees > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Users className="w-5 h-5 text-[#db2777]" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">{t('events.attendees')}</p>
                          <p className="font-semibold text-[#4a4a4a]">{event.attendees}+</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">{t('events.location')}</p>
                      <p className="font-medium text-slate-700">{event.location}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-slate-300"></div>
              <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{t('events.pastEvents')}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {paginatedPastEvents.map((event) => (
                <Card key={event.id} className="bg-slate-50 p-6 hover:shadow-lg transition-all">
                  <Badge variant="outline" className="mb-4 pointer-events-none">{getTypeLabel(event.type)}</Badge>
                  <h3 className="font-bold text-[#4a4a4a] mb-3">
                    {language === 'en' && event.title_en ? event.title_en : event.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">{formatDate(event.date)}</p>
                  <p className="text-sm text-slate-600">{event.location}</p>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </section>
        )}

        {/* Empty state */}
        {events.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {language === 'es' 
                ? 'No hay eventos disponibles en este momento.'
                : 'No events available at this time.'}
            </p>
          </Card>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#4a4a4a] to-[#6b7280] rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-serif font-bold text-white mb-4">{t('home.interestedInCollaborating')}</h3>
          <p className="text-slate-300 mb-6">
            {language === 'es' ? "Siempre abierto a participar en eventos académicos, conferencias y colaboraciones de investigación." : "Always open to participating in academic events, conferences, and research collaborations."}
          </p>
          <Link to={createPageUrl("Contact")}>
            <Button className="bg-[#db2777] hover:bg-[#db2777]/90 text-white">
              {t('common.contact')}
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}