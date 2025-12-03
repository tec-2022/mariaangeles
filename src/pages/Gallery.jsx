import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/shared/PageHeader";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import { useLanguage } from "../components/shared/LanguageContext";
import NewGalleryCarousel from "../components/gallery/NewGalleryCarousel";

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const { t, language } = useLanguage();

  // Fetch images from database
  const { data: dbImages = [] } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: () => base44.entities.GalleryImage.list('order')
  });

  const categories = ["all", "Conferencias", "Seminarios", "Docencia", "Investigación"];

  // Category labels
  const categoryLabels = {
    conferences: language === 'es' ? 'Conferencias' : 'Conferences',
    seminars: language === 'es' ? 'Seminarios' : 'Seminars',
    teaching: language === 'es' ? 'Docencia' : 'Teaching',
    research: language === 'es' ? 'Investigación' : 'Research',
    workshops: language === 'es' ? 'Talleres' : 'Workshops',
    graduations: language === 'es' ? 'Graduaciones' : 'Graduations',
    awards: language === 'es' ? 'Premios' : 'Awards',
    collaborations: language === 'es' ? 'Colaboraciones' : 'Collaborations',
    events: language === 'es' ? 'Eventos' : 'Events',
    personal: language === 'es' ? 'Personal' : 'Personal'
  };

  // Map database images
  const images = dbImages.map(img => ({
    category: categoryLabels[img.category] || img.category,
    title: img.title,
    location: img.location,
    year: img.date ? new Date(img.date).getFullYear().toString() : '',
    image: img.image_url
  }));

  const filteredImages = activeFilter === "all" 
    ? images 
    : images.filter(img => img.category === activeFilter);

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={Camera}
        title={t('gallery.title')}
        description={t('gallery.description')}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Breadcrumbs items={[{ label: t('nav.gallery') }]} />
        
        {/* New Images Carousel */}
        {dbImages.length > 0 && <NewGalleryCarousel images={dbImages} />}

        {/* Empty state */}
        {dbImages.length === 0 && (
          <Card className="p-12 text-center bg-white mb-8">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {language === 'es' 
                ? 'No hay imágenes disponibles en este momento.'
                : 'No images available at this time.'}
            </p>
          </Card>
        )}
        
        {/* Filters and Gallery - only show if there are images */}
        {images.length > 0 && (
          <>
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-8">
              <TabsList>
                <TabsTrigger value="all">{t('gallery.filters.all')}</TabsTrigger>
                <TabsTrigger value={t('gallery.filters.conferences')}>{t('gallery.filters.conferences')}</TabsTrigger>
                <TabsTrigger value={t('gallery.filters.seminars')}>{t('gallery.filters.seminars')}</TabsTrigger>
                <TabsTrigger value={t('gallery.filters.teaching')}>{t('gallery.filters.teaching')}</TabsTrigger>
                <TabsTrigger value={t('gallery.filters.research')}>{t('gallery.filters.research')}</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((item, index) => (
                <Card 
                  key={index} 
                  className="bg-white overflow-hidden hover:shadow-2xl transition-all group cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-white/20 text-white border-white/30 mb-2 pointer-events-none">
                          {item.category}
                        </Badge>
                        <h3 className="font-bold text-white">{item.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2 pointer-events-none">{item.category}</Badge>
                    <h3 className="font-bold text-[#4a4a4a] mb-2">{item.title}</h3>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{item.location}</span>
                      <span>{item.year}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedImage.image} 
              alt={selectedImage.title}
              className="w-full rounded-lg"
            />
            <div className="mt-4 text-white">
              <Badge className="bg-[#db2777]/20 text-[#db2777] border-[#db2777]/30 mb-2 pointer-events-none">
                {selectedImage.category}
              </Badge>
              <h3 className="text-xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-slate-300">
                {selectedImage.location} • {selectedImage.year}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}