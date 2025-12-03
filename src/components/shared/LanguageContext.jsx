import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
  es: {
    // Navigation
              nav: {
                home: "Inicio",
                about: "Acerca de mí",
                events: "Eventos",
                publications: "Publicaciones",
                research: "Investigación",
                teaching: "Docencia",
                blog: "Blog",
                podcast: "Podcast",
                gallery: "Galería",
                contact: "Contacto",
                analytics: "Analíticas"
              },
    // Common
    common: {
      viewAll: "Ver todos",
      viewPublications: "Ver Publicaciones",
      contact: "Contactar",
      readMore: "Leer más",
      readFullArticle: "Leer artículo completo",
      subscribe: "Suscribirme",
      sendMessage: "Enviar Mensaje",
      listenNow: "Escuchar ahora",
      play: "Reproducir",
      close: "Cerrar",
      updatedToday: "Actualizado hoy",
      new: "¡Nuevo!",
      current: "Actual",
      completed: "Completado",
      inProgress: "En curso"
    },
    // Home
              home: {
                heroTitle: "Tecnología y Educación para Transformar Vidas",
                heroSubtitle: "Investigación en usabilidad para usuarios con autismo, pensamiento computacional, IoT e inteligencia artificial aplicada a la salud",
      announcement: "Nuevo artículo publicado en IEEE Access",
      latestNews: "Últimas Novedades",
      upcomingEvents: "Próximos Eventos",
      recentPublications: "Publicaciones Recientes",
      interestedInCollaborating: "¿Interesado en colaborar?",
      collaborationText: "Siempre abierto a nuevas oportunidades de investigación, proyectos colaborativos y asesorías académicas.",
      contactMe: "Contáctame"
    },
    // Stats
    stats: {
      citations: "Citaciones",
      publications: "Publicaciones",
      thesisDirected: "Tesis Dirigidas",
              podcastListeners: "Oyentes Podcast",
      yearsExperience: "Años de Experiencia",
      recognitions: "Reconocimientos",
      institutions: "Instituciones",
      coauthors: "Coautores",
      articles: "Artículos",
      readers: "Lectores",
      categories: "Categorías",
      years: "Años",
      listeners: "Oyentes",
      episodes: "Episodios",
      content: "Contenido"
    },
    // News badges
    news: {
      newPublication: "Nueva Publicación",
      newEpisode: "Nuevo Episodio",
      recognition: "Reconocimiento"
    },
    // About
              about: {
                title: "Dra. María de los Ángeles Quezada Cisnero",
                role: "Profesora Investigadora",
                bio: "Doctora en Ciencias de la Computación con más de 68 publicaciones citadas. Experta en usabilidad de aplicaciones para usuarios con autismo, pensamiento computacional, Internet de las Cosas (IoT) e inteligencia artificial aplicada a la salud. Miembro del Tecnológico Nacional de México - Instituto Tecnológico de Tijuana.",
      academicPositions: "Posiciones Académicas",
      education: "Educación",
      continuingEducation: "Educación Continua",
      honorsAndAwards: "Honores, Premios y Becas",
      specialties: {
                    knowledgeEconomy: "Usabilidad y Autismo",
                    regionalDevelopment: "Interacción Humano-Computadora",
                    innovationEcosystems: "IA en Salud",
                    territorialCompetitiveness: "Pensamiento Computacional"
                  }
                },
    // Publications
    publications: {
      title: "Publicaciones",
      description: "Investigaciones y publicaciones académicas sobre usabilidad, autismo, inteligencia artificial, IoT e interacción humano-computadora.",
      filters: {
        all: "Todas",
        articles: "Artículos",
        conferences: "Conferencias",
        books: "Libros",
        chapters: "Capítulos"
      },
      types: {
        article: "Artículo",
        conference: "Conferencia",
        book: "Libro",
        chapter: "Capítulo"
      }
    },
    // Events
    events: {
      title: "Eventos Académicos",
      description: "Conferencias, seminarios y actividades académicas donde participo compartiendo investigación y conocimiento.",
      upcomingEvents: "Próximos Eventos",
      pastEvents: "Eventos Pasados",
      date: "Fecha",
      time: "Horario",
      location: "Ubicación",
      attendees: "Asistentes",
      types: {
        keynote: "Ponencia",
        seminar: "Seminario",
        workshop: "Workshop",
        congress: "Congreso",
        forum: "Foro"
      }
    },
    // Research
    research: {
      title: "Investigación",
      description: "Líneas de investigación enfocadas en usabilidad para usuarios con autismo, pensamiento computacional, IoT, inteligencia artificial y procesamiento de imágenes médicas.",
      researchLines: "Líneas de Investigación",
      currentProjects: "Proyectos Actuales",
      completedProjects: "Proyectos Completados",
      researchImpact: "Impacto de la Investigación",
      researchProjects: "Proyectos de Investigación",
      scientificPublications: "Publicaciones Científicas"
    },
    // Teaching
    teaching: {
      title: "Docencia",
      description: "Formando profesionales e investigadores en ciencias de la computación, inteligencia artificial y desarrollo de software.",
      currentCourses: "Cursos Actuales",
      teachingAreas: "Áreas de Enseñanza",
      thesisDirection: "Dirección de Tesis",
      teachingPhilosophy: "Filosofía Docente",
      students: "estudiantes",
      inProcess: "En Proceso",
      graduates: "Graduados",
      levels: {
        postgraduate: "Posgrado",
        masters: "Maestría",
        doctorate: "Doctorado",
        undergraduate: "Licenciatura"
      }
    },
    // Blog
    blog: {
      title: "Blog Académico",
      description: "Reflexiones, análisis y perspectivas sobre tecnología, educación, inteligencia artificial y accesibilidad.",
      subscribeToBlog: "Suscríbete al Blog",
      subscribeText: "Recibe las últimas reflexiones y análisis sobre desarrollo regional e innovación directamente en tu correo.",
      emailPlaceholder: "Tu correo electrónico",
      categories: {
        all: "Todos",
        innovation: "Innovación",
        competitiveness: "Competitividad",
        development: "Desarrollo"
      }
    },
    // Podcast
    podcast: {
      title: "Podcast",
      subtitle: "Conversaciones sobre Tecnología y Educación",
      description: "Diálogos con expertos sobre inteligencia artificial, accesibilidad, desarrollo de software y tecnología educativa.",
      latestEpisode: "Último episodio",
      allEpisodes: "Todos los Episodios",
      subscribeToPodcast: "Suscríbete al Podcast",
      subscribeText: "No te pierdas ningún episodio. Suscríbete en tu plataforma favorita.",
      withGuest: "Con"
    },
    // Gallery
    gallery: {
      title: "Galería",
      description: "Momentos destacados de conferencias, seminarios, actividades docentes y proyectos de investigación.",
      filters: {
        all: "Todas",
        conferences: "Conferencias",
        seminars: "Seminarios",
        teaching: "Docencia",
        research: "Investigación"
      }
    },
    // Contact
    contact: {
      title: "Contacto",
      description: "¿Interesado en colaborar, invitarme a un evento o conocer más sobre mi investigación? No dudes en contactarme.",
      sendMessage: "Enviar Mensaje",
      formSubtitle: "Completa el formulario y te responderé a la brevedad posible.",
      fullName: "Nombre completo",
      email: "Email",
      subject: "Asunto",
      message: "Mensaje",
      subjectPlaceholder: "¿De qué quieres hablar?",
      messagePlaceholder: "Escribe tu mensaje aquí...",
      contactInfo: "Información de Contacto",
      mainLocation: "Ubicación Principal",
      phone: "Teléfono",
      institutions: "Instituciones",
      links: "Enlaces",
      lookingForCollaboration: "¿Buscas colaboración académica?",
      collaborationText: "Siempre estoy abierto a nuevas oportunidades de investigación, proyectos colaborativos y asesorías en temas de desarrollo regional e innovación.",
      collaborationAreas: {
        research: "Investigación Colaborativa",
        conferences: "Conferencias",
        consulting: "Asesorías",
        publications: "Publicaciones"
      },
      roles: {
        principal: "Principal",
        collaborator: "Colaborador",
        visiting: "Visitante"
      }
    },
    // Social bubble
    social: {
      connect: "Conecta",
      socialNetworks: "REDES SOCIALES",
      clickToHide: "Haz clic en el botón para ocultar"
    },
    // Footer
    footer: {
      quickLinks: "Enlaces Rápidos",
      contact: "Contacto",
      allRightsReserved: "Todos los derechos reservados."
    }
  },
  en: {
    // Navigation
              nav: {
                home: "Home",
                about: "About Me",
                events: "Events",
                publications: "Publications",
                research: "Research",
                teaching: "Teaching",
                blog: "Blog",
                podcast: "Podcast",
                gallery: "Gallery",
                contact: "Contact",
                analytics: "Analytics"
              },
    // Common
    common: {
      viewAll: "View all",
      viewPublications: "View Publications",
      contact: "Contact",
      readMore: "Read more",
      readFullArticle: "Read full article",
      subscribe: "Subscribe",
      sendMessage: "Send Message",
      listenNow: "Listen now",
      play: "Play",
      close: "Close",
      updatedToday: "Updated today",
      new: "New!",
      current: "Current",
      completed: "Completed",
      inProgress: "In progress"
    },
    // Home
              home: {
                heroTitle: "Technology and Education to Transform Lives",
                heroSubtitle: "Research in usability for users with autism, computational thinking, IoT and AI applied to healthcare",
      announcement: "New article published in IEEE Access",
      latestNews: "Latest News",
      upcomingEvents: "Upcoming Events",
      recentPublications: "Recent Publications",
      interestedInCollaborating: "Interested in collaborating?",
      collaborationText: "Always open to new research opportunities, collaborative projects, and academic consulting.",
      contactMe: "Contact Me"
    },
    // Stats
    stats: {
      citations: "Citations",
      publications: "Publications",
      thesisDirected: "Thesis Directed",
      podcastListeners: "Podcast Listeners",
      yearsExperience: "Years of Experience",
      recognitions: "Recognitions",
      institutions: "Institutions",
      coauthors: "Co-authors",
      articles: "Articles",
      readers: "Readers",
      categories: "Categories",
      years: "Years",
      listeners: "Listeners",
      episodes: "Episodes",
      content: "Content"
    },
    // News badges
    news: {
      newPublication: "New Publication",
      newEpisode: "New Episode",
      recognition: "Recognition"
    },
    // About
              about: {
                title: "Dr. María de los Ángeles Quezada Cisnero",
                role: "Research Professor",
                bio: "Ph.D. in Computer Science with over 68 cited publications. Expert in usability of applications for users with autism, computational thinking, Internet of Things (IoT) and AI applied to healthcare. Member of the Tecnológico Nacional de México - Instituto Tecnológico de Tijuana.",
      academicPositions: "Academic Positions",
      education: "Education",
      continuingEducation: "Continuing Education",
      honorsAndAwards: "Honors, Awards & Scholarships",
      specialties: {
                    knowledgeEconomy: "Usability & Autism",
                    regionalDevelopment: "Human-Computer Interaction",
                    innovationEcosystems: "AI in Healthcare",
                    territorialCompetitiveness: "Computational Thinking"
                  }
                },
                // Publications
                publications: {
      title: "Publications",
      description: "Academic research and publications on usability, autism, artificial intelligence, IoT and human-computer interaction.",
      filters: {
        all: "All",
        articles: "Articles",
        conferences: "Conferences",
        books: "Books",
        chapters: "Chapters"
      },
      types: {
        article: "Article",
        conference: "Conference",
        book: "Book",
        chapter: "Chapter"
      }
    },
    // Events
    events: {
      title: "Academic Events",
      description: "Conferences, seminars, and academic activities where I participate sharing research and knowledge.",
      upcomingEvents: "Upcoming Events",
      pastEvents: "Past Events",
      date: "Date",
      time: "Time",
      location: "Location",
      attendees: "Attendees",
      types: {
        keynote: "Keynote",
        seminar: "Seminar",
        workshop: "Workshop",
        congress: "Congress",
        forum: "Forum"
      }
    },
    // Research
    research: {
      title: "Research",
      description: "Research lines focused on usability for users with autism, computational thinking, IoT, artificial intelligence and medical image processing.",
      researchLines: "Research Lines",
      currentProjects: "Current Projects",
      completedProjects: "Completed Projects",
      researchImpact: "Research Impact",
      researchProjects: "Research Projects",
      scientificPublications: "Scientific Publications"
    },
    // Teaching
    teaching: {
      title: "Teaching",
      description: "Training professionals and researchers in computer science, artificial intelligence and software development.",
      currentCourses: "Current Courses",
      teachingAreas: "Teaching Areas",
      thesisDirection: "Thesis Direction",
      teachingPhilosophy: "Teaching Philosophy",
      students: "students",
      inProcess: "In Progress",
      graduates: "Graduates",
      levels: {
        postgraduate: "Postgraduate",
        masters: "Masters",
        doctorate: "Doctorate",
        undergraduate: "Undergraduate"
      }
    },
    // Blog
    blog: {
      title: "Academic Blog",
      description: "Reflections, analysis, and perspectives on technology, education, artificial intelligence and accessibility.",
      subscribeToBlog: "Subscribe to Blog",
      subscribeText: "Receive the latest reflections and analysis on regional development and innovation directly in your inbox.",
      emailPlaceholder: "Your email address",
      categories: {
        all: "All",
        innovation: "Innovation",
        competitiveness: "Competitiveness",
        development: "Development"
      }
    },
    // Podcast
    podcast: {
      title: "Podcast",
      subtitle: "Conversations about Technology and Education",
      description: "Dialogues with experts on artificial intelligence, accessibility, software development and educational technology.",
      latestEpisode: "Latest episode",
      allEpisodes: "All Episodes",
      subscribeToPodcast: "Subscribe to Podcast",
      subscribeText: "Don't miss any episode. Subscribe on your favorite platform.",
      withGuest: "With"
    },
    // Gallery
    gallery: {
      title: "Gallery",
      description: "Highlighted moments from conferences, seminars, teaching activities, and research projects.",
      filters: {
        all: "All",
        conferences: "Conferences",
        seminars: "Seminars",
        teaching: "Teaching",
        research: "Research"
      }
    },
    // Contact
    contact: {
      title: "Contact",
      description: "Interested in collaborating, inviting me to an event, or learning more about my research? Don't hesitate to contact me.",
      sendMessage: "Send Message",
      formSubtitle: "Fill out the form and I'll respond as soon as possible.",
      fullName: "Full name",
      email: "Email",
      subject: "Subject",
      message: "Message",
      subjectPlaceholder: "What would you like to discuss?",
      messagePlaceholder: "Write your message here...",
      contactInfo: "Contact Information",
      mainLocation: "Main Location",
      phone: "Phone",
      institutions: "Institutions",
      links: "Links",
      lookingForCollaboration: "Looking for academic collaboration?",
      collaborationText: "I'm always open to new research opportunities, collaborative projects, and consulting on regional development and innovation topics.",
      collaborationAreas: {
        research: "Collaborative Research",
        conferences: "Conferences",
        consulting: "Consulting",
        publications: "Publications"
      },
      roles: {
        principal: "Principal",
        collaborator: "Collaborator",
        visiting: "Visiting"
      }
    },
    // Social bubble
    social: {
      connect: "Connect",
      socialNetworks: "SOCIAL NETWORKS",
      clickToHide: "Click the button to hide"
    },
    // Footer
    footer: {
      quickLinks: "Quick Links",
      contact: "Contact",
      allRightsReserved: "All rights reserved."
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredLanguage') || 'es';
    }
    return 'es';
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}