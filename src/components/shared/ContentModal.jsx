import React, { useEffect } from "react";
import { X, Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "./LanguageContext";
import { trackContentView } from "./Analytics";

export default function ContentModal({ isOpen, onClose, content, type }) {
  const { language } = useLanguage();

  useEffect(() => {
    if (isOpen && content) {
      trackContentView(type, content.id || content.title, content.title);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, content, type]);

  if (!isOpen || !content) return null;

  const renderContent = () => {
    switch (type) {
      case 'publication':
        const pubTitle = language === 'en' && content.title_en ? content.title_en : content.title;
        const pubAbstract = language === 'en' && content.abstract_en ? content.abstract_en : content.abstract;
        return (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline">{content.type}</Badge>
              <span className="text-sm text-slate-500">{content.year}</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#0A2540] mb-4">{pubTitle}</h2>
            {content.authors && (
              <p className="text-slate-600 mb-4"><strong>{language === 'es' ? 'Autores:' : 'Authors:'}</strong> {content.authors}</p>
            )}
            <p className="text-slate-600 italic mb-4">{content.journal}</p>
            {content.volume && <p className="text-slate-500 mb-2">{content.volume}</p>}
            {content.pages && <p className="text-slate-500 mb-2">{content.pages}</p>}
            {pubAbstract && (
              <div className="mt-6">
                <h3 className="font-bold text-[#0A2540] mb-2">{language === 'es' ? 'Resumen' : 'Abstract'}</h3>
                <p className="text-slate-600">{pubAbstract}</p>
              </div>
            )}
            {content.doi && (
              <a 
                href={`https://doi.org/${content.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#0A2540] mt-4 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                DOI: {content.doi}
              </a>
            )}
          </div>
        );

      case 'event':
        return (
          <div>
            <Badge className="badge-gold mb-4">{content.type}</Badge>
            <h2 className="text-2xl font-serif font-bold text-[#0A2540] mb-4">{content.title}</h2>
            <p className="text-slate-600 mb-6">{content.description}</p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-slate-400">{language === 'es' ? 'Fecha' : 'Date'}</p>
                  <p className="font-medium">{content.date}</p>
                </div>
              </div>
              {content.time && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'es' ? 'Horario' : 'Time'}</p>
                    <p className="font-medium">{content.time}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-slate-400">{language === 'es' ? 'Ubicación' : 'Location'}</p>
                  <p className="font-medium">{content.location}</p>
                </div>
              </div>
              {content.attendees && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'es' ? 'Asistentes' : 'Attendees'}</p>
                    <p className="font-medium">{content.attendees}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'blog':
        return (
          <div>
            <Badge variant="outline" className="mb-4">{content.category}</Badge>
            <h2 className="text-2xl font-serif font-bold text-[#0A2540] mb-4">{content.title}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
              <span>{content.date}</span>
              {content.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {content.readTime}
                </span>
              )}
            </div>
            {content.image && (
              <img src={content.image} alt={content.title} className="w-full h-64 object-cover rounded-lg mb-6" />
            )}
            <div className="prose max-w-none text-slate-600">
              <p>{content.excerpt}</p>
              {content.fullContent && <div dangerouslySetInnerHTML={{ __html: content.fullContent }} />}
            </div>
          </div>
        );

      case 'podcast':
        return (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline">{language === 'es' ? 'Episodio' : 'Episode'} {content.number}</Badge>
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {content.duration}
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#0A2540] mb-2">{content.title}</h2>
            <p className="text-[#D4AF37] font-medium mb-4">{language === 'es' ? 'Con' : 'With'} {content.guest}</p>
            {content.image && (
              <img src={content.image} alt={content.title} className="w-full h-48 object-cover rounded-lg mb-6" />
            )}
            <p className="text-slate-600 mb-6">{content.description}</p>
            <p className="text-sm text-slate-500">{content.date}</p>
            
            <Button className="mt-6 bg-[#D4AF37] hover:bg-[#c4a030] text-white">
              {language === 'es' ? 'Escuchar episodio' : 'Listen to episode'}
            </Button>
          </div>
        );

      default:
        return <p className="text-slate-600">{content.description || content.excerpt || ''}</p>;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-[#0A2540]">
            {type === 'publication' && (language === 'es' ? 'Publicación' : 'Publication')}
            {type === 'event' && (language === 'es' ? 'Evento' : 'Event')}
            {type === 'blog' && (language === 'es' ? 'Artículo' : 'Article')}
            {type === 'podcast' && (language === 'es' ? 'Episodio' : 'Episode')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}