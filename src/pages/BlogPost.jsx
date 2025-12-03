import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../components/shared/LanguageContext";
import { trackContentView, trackScrollDepth, trackTimeOnPage } from "../components/shared/Analytics";
import LikeShareButtons from "../components/blog/LikeShareButtons";
import CommentSection from "../components/blog/CommentSection";

export default function BlogPost() {
  const { language } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  // Sample posts data (in production, fetch from backend)
  const posts = [
    {
      id: "1",
      category: "Innovación",
      title: "El Futuro de los Ecosistemas de Innovación en América Latina",
      excerpt: "Reflexiones sobre cómo las regiones latinoamericanas están construyendo sus propios modelos de innovación.",
      date: "15 de Marzo, 2024",
      readTime: "8 min",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
      content: `
        <p>Los ecosistemas de innovación en América Latina están experimentando una transformación sin precedentes. A diferencia de los modelos tradicionales importados de Silicon Valley o Europa, las regiones latinoamericanas están desarrollando enfoques únicos que responden a sus realidades sociales, económicas y culturales.</p>
        
        <h2>El Contexto Latinoamericano</h2>
        <p>América Latina presenta características distintivas que influyen en cómo se desarrollan sus ecosistemas de innovación. La diversidad cultural, las brechas de desigualdad y la riqueza de recursos naturales crean un contexto único para la innovación.</p>
        
        <h2>Modelos Emergentes</h2>
        <p>Ciudades como Medellín, São Paulo, Buenos Aires y Monterrey están liderando nuevos modelos de ecosistemas que priorizan la inclusión social y el desarrollo sostenible junto con el crecimiento económico.</p>
        
        <h2>Desafíos y Oportunidades</h2>
        <p>Los principales desafíos incluyen el acceso al financiamiento, la formación de talento especializado y la conexión entre academia e industria. Sin embargo, estos mismos desafíos representan oportunidades para innovar en los procesos mismos de innovación.</p>
        
        <h2>Conclusiones</h2>
        <p>El futuro de los ecosistemas de innovación en América Latina dependerá de nuestra capacidad para desarrollar modelos propios, adaptados a nuestras realidades, sin perder de vista las mejores prácticas globales.</p>
      `
    },
    {
      id: "2",
      category: "Competitividad",
      title: "Competitividad Regional en la Era Digital",
      excerpt: "Análisis de cómo la transformación digital está redefiniendo las ventajas competitivas de las regiones.",
      date: "8 de Marzo, 2024",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      content: `
        <p>La transformación digital está reconfigurando el mapa de la competitividad regional a nivel global. Las ventajas tradicionales basadas en ubicación geográfica y recursos naturales están siendo complementadas —y en algunos casos reemplazadas— por nuevas capacidades digitales.</p>
        
        <h2>Nuevas Métricas de Competitividad</h2>
        <p>La conectividad, la alfabetización digital y la capacidad de adopción tecnológica se han convertido en indicadores clave de la competitividad regional.</p>
        
        <h2>El Rol del Gobierno Local</h2>
        <p>Los gobiernos locales tienen un papel fundamental en crear las condiciones para la transformación digital de sus regiones, desde la infraestructura hasta las políticas de apoyo al emprendimiento tecnológico.</p>
      `
    },
    {
      id: "3",
      category: "Sociedad",
      title: "La Sociedad del Conocimiento: Más Allá del Discurso",
      excerpt: "Una mirada crítica a cómo las sociedades latinoamericanas están aprovechando el conocimiento como motor de desarrollo.",
      date: "1 de Marzo, 2024",
      readTime: "10 min",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
      content: `
        <p>El concepto de "sociedad del conocimiento" se ha convertido en un lugar común en el discurso político y académico. Sin embargo, ¿hasta qué punto nuestras sociedades latinoamericanas están realmente aprovechando el conocimiento como motor de desarrollo?</p>
        
        <h2>Más Allá de la Retórica</h2>
        <p>Es necesario ir más allá de los discursos y analizar con datos concretos cómo se está generando, difundiendo y aplicando el conocimiento en nuestras economías y sociedades.</p>
        
        <h2>Brechas Persistentes</h2>
        <p>A pesar de los avances, persisten brechas significativas en acceso a educación de calidad, inversión en I+D y capacidad de innovación entre diferentes regiones y grupos sociales.</p>
      `
    }
  ];

  const post = posts.find(p => p.id === postId) || posts[0];
  const contentRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  useEffect(() => {
    if (post) {
      trackContentView('blog', post.id, post.title);
      startTimeRef.current = Date.now();
    }
  }, [post]);

  // Track scroll depth
  useEffect(() => {
    if (!post) return;

    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const total = element.offsetHeight - window.innerHeight;
      const depth = Math.min(100, Math.round((scrolled / total) * 100));
      
      if (depth > maxScrollDepth) {
        setMaxScrollDepth(depth);
        // Track at 25%, 50%, 75%, 100%
        if ([25, 50, 75, 100].includes(depth)) {
          trackScrollDepth(post.id, depth);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post, maxScrollDepth]);

  // Track time on page when leaving
  useEffect(() => {
    if (!post) return;

    const handleBeforeUnload = () => {
      const seconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackTimeOnPage(post.id, seconds);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{language === 'es' ? 'Artículo no encontrado' : 'Article not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Image */}
      <div className="relative h-[50vh] overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <Link 
              to={createPageUrl("Blog")}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'es' ? 'Volver al Blog' : 'Back to Blog'}
            </Link>
            <Badge className="badge-gold mb-4">{post.category}</Badge>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">{post.title}</h1>
            <div className="flex items-center gap-6 text-white/80">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12" ref={contentRef}>
        <Card className="bg-white p-8 md:p-12 -mt-20 relative z-10 shadow-xl">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-[#0A2540] prose-headings:font-serif prose-p:text-slate-600 prose-a:text-[#D4AF37]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Like and Share */}
          <div className="border-t mt-12 pt-8">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">
                {language === 'es' ? '¿Te gustó este artículo?' : 'Did you like this article?'}
              </p>
              <LikeShareButtons postId={post.id} postTitle={post.title} />
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <CommentSection postId={post.id} />

        {/* Back to Blog */}
        <div className="text-center mt-12">
          <Link to={createPageUrl("Blog")}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Ver más artículos' : 'View more articles'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}