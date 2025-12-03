import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "../shared/LanguageContext";

export default function NewGalleryCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();
  
  // Get only the newest images (last 30 days or last 5 images)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newImages = images
    .filter(img => {
      if (img.created_date) {
        return new Date(img.created_date) >= thirtyDaysAgo;
      }
      return false;
    })
    .slice(0, 10);

  // If no new images in last 30 days, show the 5 most recent
  const displayImages = newImages.length > 0 ? newImages : images.slice(0, 5);

  useEffect(() => {
    if (displayImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [displayImages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  if (displayImages.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-[#D4AF37]" />
        <h2 className="text-2xl font-serif font-bold text-[#0A2540]">
          {language === 'es' ? 'Nuevas Imágenes' : 'New Images'}
        </h2>
        <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30">
          {language === 'es' ? '¡Nuevo!' : 'New!'}
        </Badge>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative h-[400px] md:h-[500px]">
          {displayImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.image_url || image.image}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <Badge className="bg-white/20 text-white border-white/30 mb-3">
                  {image.category === 'conferences' ? (language === 'es' ? 'Conferencias' : 'Conferences') :
                   image.category === 'seminars' ? (language === 'es' ? 'Seminarios' : 'Seminars') :
                   image.category === 'teaching' ? (language === 'es' ? 'Docencia' : 'Teaching') :
                   image.category === 'research' ? (language === 'es' ? 'Investigación' : 'Research') : 
                   image.category}
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {image.title}
                </h3>
                {image.location && (
                  <p className="text-white/80">
                    {image.location} {image.date && `• ${new Date(image.date).getFullYear()}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Dots Indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-[#D4AF37] w-6' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}