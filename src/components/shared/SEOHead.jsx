import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function SEOHead({ 
  title: propTitle, 
  description: propDescription,
  keywords: propKeywords,
  image: propImage,
  url: propUrl
}) {
  // Fetch SEO settings from database
  const { data: seoSettings = [] } = useQuery({
    queryKey: ['seo-settings-head'],
    queryFn: () => base44.entities.SiteSettings.filter({ category: 'seo' }),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const getSetting = (key) => seoSettings.find(s => s.key === key)?.value || '';

  // Use props first, then fall back to database settings, then defaults
  const title = propTitle || getSetting('site_title') || "Dra. María de los Ángeles Quezada Cisnero - Investigadora";
  const description = propDescription || getSetting('meta_description') || "Profesora Investigadora en el Instituto Tecnológico de Tijuana. Doctora en Ciencias de la Computación. Especialista en Usabilidad, Autismo, Interacción Humano-Computadora e Inteligencia Artificial aplicada a la Salud.";
  const keywords = propKeywords || getSetting('keywords') || "María de los Ángeles Quezada, Dra. Quezada, investigadora ITT, usabilidad, autismo, interacción humano-computadora, inteligencia artificial, salud, pensamiento computacional, Baja California";
  const image = propImage || getSetting('og_image') || "";
  const url = propUrl || getSetting('site_url') || "";
  const twitterHandle = getSetting('twitter_handle') || "";
  const ogTitle = getSetting('og_title') || title;
  const ogDescription = getSetting('og_description') || description;

  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic SEO
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', 'Dra. María de los Ángeles Quezada Cisnero');
    updateMeta('robots', 'index, follow');
    updateMeta('language', 'es');
    updateMeta('geo.region', 'MX-BCN');
    updateMeta('geo.placename', 'Tijuana, Baja California');
    
    // Open Graph
    updateMeta('og:title', ogTitle, true);
    updateMeta('og:description', ogDescription, true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:locale', 'es_MX', true);
    updateMeta('og:site_name', 'Dra. María de los Ángeles Quezada', true);
    if (image) updateMeta('og:image', image, true);
    if (url) updateMeta('og:url', url, true);
    
    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', ogTitle);
    updateMeta('twitter:description', ogDescription);
    if (image) updateMeta('twitter:image', image);
    if (twitterHandle) updateMeta('twitter:site', twitterHandle);
    if (twitterHandle) updateMeta('twitter:creator', twitterHandle);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url || window.location.origin + window.location.pathname);

    // Structured data for Google (Person Schema)
    let script = document.querySelector('script[type="application/ld+json"][data-type="person"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-type', 'person');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Dra. María de los Ángeles Quezada Cisnero",
      "givenName": "María de los Ángeles",
      "familyName": "Quezada Cisnero",
      "jobTitle": "Profesora Investigadora",
      "honorificPrefix": "Dra.",
      "affiliation": {
        "@type": "EducationalOrganization",
        "name": "Instituto Tecnológico de Tijuana",
        "department": "Tecnológico Nacional de México"
      },
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "Instituto Tecnológico de Tijuana"
        }
      ],
      "knowsAbout": [
        "Usabilidad para usuarios con autismo",
        "Interacción Humano-Computadora",
        "Inteligencia Artificial en Salud",
        "Pensamiento Computacional",
        "Internet de las Cosas"
      ],
      "description": description,
      "email": "angeles.quezada@tectijuana.edu.mx",
      "url": url || window.location.origin,
      "sameAs": []
    });

    // Website Schema
    let websiteScript = document.querySelector('script[type="application/ld+json"][data-type="website"]');
    if (!websiteScript) {
      websiteScript = document.createElement('script');
      websiteScript.type = 'application/ld+json';
      websiteScript.setAttribute('data-type', 'website');
      document.head.appendChild(websiteScript);
    }
    websiteScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Dra. María de los Ángeles Quezada - Sitio Académico",
      "url": url || window.location.origin,
      "description": description,
      "author": {
        "@type": "Person",
        "name": "Dra. María de los Ángeles Quezada Cisnero"
      },
      "inLanguage": ["es", "en"]
    });

  }, [title, description, keywords, image, url, ogTitle, ogDescription, twitterHandle]);

  return null;
}