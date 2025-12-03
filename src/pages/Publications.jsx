import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Users, FileText, ExternalLink, Loader2, Quote, Award, Handshake, TrendingUp } from "lucide-react";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/shared/PageHeader";
import Pagination from "../components/shared/Pagination";
import SearchBar from "../components/shared/SearchBar";
import ContentModal from "../components/shared/ContentModal";
import { useLanguage } from "../components/shared/LanguageContext";

export default function Publications() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPublication, setSelectedPublication] = useState(null);
  const itemsPerPage = 6;
  const { t, language } = useLanguage();

  // Fetch publications from database
  const { data: publications = [], isLoading } = useQuery({
    queryKey: ['publications-page'],
    queryFn: () => base44.entities.Publication.list('-year')
  });

  // Fetch stats from settings
  const { data: settings = [] } = useQuery({
    queryKey: ['publications-stats'],
    queryFn: () => base44.entities.SiteSettings.filter({ category: 'stats' })
  });

  const getSetting = (key, defaultValue) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const stats = [
    { value: getSetting('publications', '50+'), label: t('stats.publications'), icon: BookOpen },
    { value: getSetting('citations', '1,200+'), label: t('stats.citations'), icon: Quote },
    { value: getSetting('coauthors', '15'), label: t('stats.coauthors'), icon: Handshake },
    { value: getSetting('h_index', '28'), label: 'H-Index', icon: TrendingUp },
  ];

  const filterMap = {
    "all": t('publications.filters.all'),
    "Artículo Indexado": language === 'es' ? 'Artículos Indexados' : 'Indexed Articles',
    "Artículo Arbitrado": language === 'es' ? 'Artículos Arbitrados' : 'Peer-Reviewed Articles',
    "Conferencia": t('publications.filters.conferences'),
    "Libro": t('publications.filters.books'),
    "Capítulo de Libro": language === 'es' ? 'Capítulos de Libro' : 'Book Chapters',
    "Memoria de Congreso": language === 'es' ? 'Memorias de Congreso' : 'Conference Proceedings',
    "Tesis Dirigida": language === 'es' ? 'Tesis Dirigidas' : 'Directed Theses'
  };

  // Get type label for display
  const getTypeLabel = (type) => {
    const typeLabels = {
      es: {
        "Artículo Indexado": "Artículo Indexado",
        "Artículo Arbitrado": "Artículo Arbitrado",
        "Artículo Divulgación": "Artículo de Divulgación",
        "Conferencia": "Conferencia",
        "Libro": "Libro",
        "Capítulo de Libro": "Capítulo de Libro",
        "Memoria de Congreso": "Memoria de Congreso",
        "Tesis Dirigida": "Tesis Dirigida",
        "Reporte Técnico": "Reporte Técnico",
        "Working Paper": "Working Paper",
        "Nota Editorial": "Nota Editorial"
      },
      en: {
        "Artículo Indexado": "Indexed Article",
        "Artículo Arbitrado": "Peer-Reviewed Article",
        "Artículo Divulgación": "Outreach Article",
        "Conferencia": "Conference",
        "Libro": "Book",
        "Capítulo de Libro": "Book Chapter",
        "Memoria de Congreso": "Conference Proceeding",
        "Tesis Dirigida": "Directed Thesis",
        "Reporte Técnico": "Technical Report",
        "Working Paper": "Working Paper",
        "Nota Editorial": "Editorial Note"
      }
    };
    return typeLabels[language]?.[type] || type;
  };

  const filteredPublications = publications
    .filter(p => activeFilter === "all" || p.type === activeFilter || p.type?.includes(activeFilter.replace('Artículo ', '')))
    .filter(p => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return p.title?.toLowerCase().includes(query) || 
             (p.authors && p.authors.toLowerCase().includes(query)) ||
             p.journal?.toLowerCase().includes(query);
    });

  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  const paginatedPublications = filteredPublications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={BookOpen}
        title={t('publications.title')}
        description={t('publications.description')}
      />

      {/* Stats */}
      <section className="relative -mt-12 z-10 mb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white shadow-xl p-6 text-center">
                <stat.icon className="w-8 h-8 text-[#db2777] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#4a4a4a] mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <Breadcrumbs items={[{ label: t('nav.publications') }]} />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder={language === 'es' ? "Buscar publicaciones..." : "Search publications..."}
            className="md:w-80"
          />
          <Tabs value={activeFilter} onValueChange={handleFilterChange} className="flex-1">
            <TabsList>
              {Object.entries(filterMap).map(([key, value]) => (
                <TabsTrigger key={key} value={key}>{value}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#db2777]" />
          </div>
        ) : filteredPublications.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {language === 'es' ? 'No hay publicaciones disponibles' : 'No publications available'}
            </p>
          </Card>
        ) : (
          <>
            {/* Publications List */}
            <div className="space-y-4">
              {paginatedPublications.map((pub) => (
                <Card 
                  key={pub.id} 
                  className="bg-white p-6 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedPublication(pub)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="text-[#4a4a4a] pointer-events-none">{getTypeLabel(pub.type)}</Badge>
                        <span className="text-sm text-slate-500 font-medium">{pub.year}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#4a4a4a] mb-2">
                        {language === 'en' && pub.title_en ? pub.title_en : pub.title}
                      </h3>
                      
                      {pub.authors && (
                        <p className="text-sm text-slate-600 flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          {pub.authors}
                        </p>
                      )}
                      
                      <p className="text-sm text-slate-600 italic mb-2">{pub.journal}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {pub.volume && <span>{pub.volume}</span>}
                        {pub.pages && <span>• {pub.pages}</span>}
                        {pub.isbn && <span>• ISBN: {pub.isbn}</span>}
                      </div>
                      
                      {pub.doi && (
                        <a 
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[#db2777] hover:text-[#4a4a4a] text-sm mt-3 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          DOI: {pub.doi}
                        </a>
                      )}
                    </div>
                    
                    <FileText className="w-12 h-12 text-slate-200" />
                  </div>
                </Card>
              ))}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        <ContentModal
          isOpen={!!selectedPublication}
          onClose={() => setSelectedPublication(null)}
          content={selectedPublication}
          type="publication"
        />
      </div>
    </div>
  );
}