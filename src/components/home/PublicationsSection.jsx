import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { FileText, BookOpen, Newspaper, Users, Award, File } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "../shared/LanguageContext";

export default function PublicationsSection() {
  const { t, language } = useLanguage();
  
  const { data: publications = [] } = useQuery({
    queryKey: ['home-publications'],
    queryFn: () => contentClient.entities.Publication.list('-year', 3)
  });

  const getTypeIcon = (type) => {
    const icons = {
      "Artículo Indexado": FileText,
      "Artículo Arbitrado": FileText,
      "Artículo Divulgación": Newspaper,
      "Conferencia": Users,
      "Libro": BookOpen,
      "Capítulo de Libro": BookOpen,
      "Memoria de Congreso": Users,
      "Tesis Dirigida": Award,
      "Reporte Técnico": File,
      "Working Paper": File,
      "Nota Editorial": Newspaper
    };
    return icons[type] || FileText;
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      es: {
        "Artículo Indexado": "Artículo Indexado",
        "Artículo Arbitrado": "Artículo Arbitrado",
        "Artículo Divulgación": "Artículo Divulgación",
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

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-12 rounded-full bg-[#D4AF37]"></div>
          <h2 className="text-4xl font-serif font-bold text-[#0A2540]">{t('home.recentPublications')}</h2>
        </div>
        <Link 
          to={createPageUrl("Publications")} 
          className="text-[#D4AF37] hover:text-[#0A2540] font-medium text-sm transition-colors"
        >
          {t('common.viewAll')}
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {publications.map((pub) => (
          <Card 
            key={pub.id}
            className="bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-slate-600 badge-elegant">
                  {getTypeLabel(pub.type)}
                </Badge>
                {React.createElement(getTypeIcon(pub.type), { className: "w-8 h-8 text-slate-300 group-hover:text-[#D4AF37] transition-colors" })}
              </div>
              <h3 className="text-lg font-bold text-[#0A2540] group-hover:text-[#D4AF37] transition-colors mb-3 line-clamp-2">
                {language === 'en' && pub.title_en ? pub.title_en : pub.title}
              </h3>
              <p className="text-sm text-slate-500 italic mb-2">{pub.journal}</p>
              <p className="text-sm font-semibold text-[#D4AF37]">{pub.year}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}