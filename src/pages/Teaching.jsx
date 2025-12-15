import React from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Users, BookOpen, Brain, Heart, Code, Database, Cpu, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "../components/shared/PageHeader";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import { useLanguage } from "../components/shared/LanguageContext";

export default function Teaching() {
  const { t, language } = useLanguage();

  // Fetch courses from database
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['teaching-courses'],
    queryFn: () => contentClient.entities.Course.list()
  });

  // Fetch settings for thesis stats
  const { data: settings = [] } = useQuery({
    queryKey: ['teaching-settings'],
    queryFn: () => contentClient.entities.SiteSettings.filter({ category: 'stats' })
  });

  const getSetting = (key, defaultValue) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const currentCourses = courses.filter(c => c.is_current);

  const getLevelLabel = (level) => {
    const levels = {
      undergraduate: t('teaching.levels.undergraduate'),
      masters: t('teaching.levels.masters'),
      doctorate: t('teaching.levels.doctorate'),
      postgraduate: t('teaching.levels.postgraduate')
    };
    return levels[level] || level;
  };

  const teachingAreas = [
    { 
      icon: Heart, 
      title: language === 'es' ? "Usabilidad y Accesibilidad" : "Usability & Accessibility", 
      topics: language === 'es' 
        ? ["Diseño Inclusivo", "Interfaces para Autismo", "Experiencia de Usuario", "Evaluación de Usabilidad"] 
        : ["Inclusive Design", "Autism-Friendly Interfaces", "User Experience", "Usability Evaluation"] 
    },
    { 
      icon: Brain, 
      title: language === 'es' ? "Inteligencia Artificial" : "Artificial Intelligence", 
      topics: language === 'es' 
        ? ["Machine Learning", "IA en Salud", "Procesamiento de Imágenes", "Redes Neuronales"] 
        : ["Machine Learning", "AI in Healthcare", "Image Processing", "Neural Networks"] 
    },
    { 
      icon: Code, 
      title: language === 'es' ? "Pensamiento Computacional" : "Computational Thinking", 
      topics: language === 'es' 
        ? ["Resolución de Problemas", "Algoritmos", "Programación Educativa", "Lógica Computacional"] 
        : ["Problem Solving", "Algorithms", "Educational Programming", "Computational Logic"] 
    },
    { 
      icon: Database, 
      title: language === 'es' ? "Internet de las Cosas (IoT)" : "Internet of Things (IoT)", 
      topics: language === 'es' 
        ? ["Sensores y Actuadores", "Sistemas Embebidos", "Conectividad", "Aplicaciones IoT"] 
        : ["Sensors & Actuators", "Embedded Systems", "Connectivity", "IoT Applications"] 
    },
  ];

  const thesisStats = {
    inProgress: { 
      doctorado: { value: parseInt(getSetting('thesis_doctorate_progress', '0')) || 0, show: getSetting('thesis_doctorate_progress_show', 'true') === 'true' },
      maestria: { value: parseInt(getSetting('thesis_masters_progress', '0')) || 0, show: getSetting('thesis_masters_progress_show', 'true') === 'true' },
      licenciatura: { value: parseInt(getSetting('thesis_undergrad_progress', '0')) || 0, show: getSetting('thesis_undergrad_progress_show', 'true') === 'true' }
    },
    graduated: { 
      doctorado: { value: parseInt(getSetting('thesis_doctorate_graduated', '0')) || 0, show: getSetting('thesis_doctorate_graduated_show', 'true') === 'true' },
      maestria: { value: parseInt(getSetting('thesis_masters_graduated', '0')) || 0, show: getSetting('thesis_masters_graduated_show', 'true') === 'true' },
      licenciatura: { value: parseInt(getSetting('thesis_undergrad_graduated', '0')) || 0, show: getSetting('thesis_undergrad_graduated_show', 'true') === 'true' }
    }
  };

  const showThesisSection = getSetting('thesis_section_show', 'true') === 'true';
  const hasThesisStats = showThesisSection && (
    Object.values(thesisStats.inProgress).some(v => v.show && v.value > 0) || 
    Object.values(thesisStats.graduated).some(v => v.show && v.value > 0)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader icon={GraduationCap} title={t('teaching.title')} description={t('teaching.description')} />
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={GraduationCap}
        title={t('teaching.title')}
        description={t('teaching.description')}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <Breadcrumbs items={[{ label: t('nav.teaching') }]} />
        
        {/* Current Courses */}
        {currentCourses.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-[#D4AF37]"></div>
              <h2 className="text-3xl font-serif font-bold text-[#0A2540]">{t('teaching.currentCourses')}</h2>
            </div>

            <div className="space-y-4">
              {currentCourses.map((course) => (
                <Card key={course.id} className="bg-white p-6 hover:shadow-xl transition-all">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-[#0A2540] text-white pointer-events-none">{getLevelLabel(course.level)}</Badge>
                    {course.period && <Badge variant="outline" className="pointer-events-none">{course.period}</Badge>}
                    {course.students > 0 && (
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students} {t('teaching.students')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#0A2540] mb-2">
                    {language === 'en' && course.title_en ? course.title_en : course.title}
                  </h3>
                  {course.description && (
                    <p className="text-slate-600 mb-2">
                      {language === 'en' && course.description_en ? course.description_en : course.description}
                    </p>
                  )}
                  {course.institution && <p className="text-sm text-slate-500">{course.institution}</p>}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Teaching Areas */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-12 rounded-full bg-[#D4AF37]"></div>
            <h2 className="text-3xl font-serif font-bold text-[#0A2540]">{t('teaching.teachingAreas')}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachingAreas.map((area, index) => (
              <Card key={index} className="bg-white p-6 hover:shadow-xl transition-all text-center">
                <area.icon className="w-10 h-10 mx-auto mb-4 text-[#D4AF37]" />
                <h3 className="font-bold text-[#0A2540] mb-4">{area.title}</h3>
                <div className="space-y-2">
                  {area.topics.map((topic, topicIndex) => (
                    <Badge key={topicIndex} variant="outline" className="block text-xs pointer-events-none">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Thesis Direction - Only show if there's data */}
        {hasThesisStats && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-[#D4AF37]"></div>
              <h2 className="text-3xl font-serif font-bold text-[#0A2540]">{t('teaching.thesisDirection')}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.values(thesisStats.inProgress).some(v => v.show && v.value > 0) && (
                <Card className="bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] p-6 text-white">
                  <h3 className="font-bold mb-6 flex items-center gap-2">
                    {t('teaching.inProcess')}
                  </h3>
                  <div className="space-y-3">
                    {thesisStats.inProgress.doctorado.show && thesisStats.inProgress.doctorado.value > 0 && (
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3">
                        <span className="text-slate-200">{t('teaching.levels.doctorate')}</span>
                        <span className="text-2xl font-bold text-[#D4AF37]">{thesisStats.inProgress.doctorado.value}</span>
                      </div>
                    )}
                    {thesisStats.inProgress.maestria.show && thesisStats.inProgress.maestria.value > 0 && (
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3">
                        <span className="text-slate-200">{t('teaching.levels.masters')}</span>
                        <span className="text-2xl font-bold text-[#D4AF37]">{thesisStats.inProgress.maestria.value}</span>
                      </div>
                    )}
                    {thesisStats.inProgress.licenciatura.show && thesisStats.inProgress.licenciatura.value > 0 && (
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3">
                        <span className="text-slate-200">{t('teaching.levels.undergraduate')}</span>
                        <span className="text-2xl font-bold text-[#D4AF37]">{thesisStats.inProgress.licenciatura.value}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {Object.values(thesisStats.graduated).some(v => v.show && v.value > 0) && (
                <Card className="bg-gradient-to-br from-[#0A2540] to-[#1e3a5f] p-6 text-white border-2 border-[#D4AF37]/30">
                  <h3 className="font-bold mb-6 flex items-center gap-2">
                    {t('teaching.graduates')}
                  </h3>
                  <div className="space-y-3">
                    {thesisStats.graduated.doctorado.show && thesisStats.graduated.doctorado.value > 0 && (
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3">
                        <span className="text-green-300">{t('teaching.levels.doctorate')}</span>
                        <span className="text-2xl font-bold text-green-400">{thesisStats.graduated.doctorado.value}</span>
                      </div>
                    )}
                    {thesisStats.graduated.maestria.show && thesisStats.graduated.maestria.value > 0 && (
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3">
                        <span className="text-green-300">{t('teaching.levels.masters')}</span>
                        <span className="text-2xl font-bold text-green-400">{thesisStats.graduated.maestria.value}</span>
                      </div>
                    )}
                    {thesisStats.graduated.licenciatura.show && thesisStats.graduated.licenciatura.value > 0 && (
                      <div className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-3">
                        <span className="text-green-300">{t('teaching.levels.undergraduate')}</span>
                        <span className="text-2xl font-bold text-green-400">{thesisStats.graduated.licenciatura.value}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </section>
        )}

        {/* Teaching Philosophy */}
        <section className="bg-gradient-to-br from-pink-50 to-fuchsia-50 rounded-2xl p-8 border border-pink-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1 h-12 rounded-full bg-gradient-to-b from-pink-400 to-fuchsia-500"></div>
            <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{t('teaching.teachingPhilosophy')}</h2>
          </div>
          <div className="prose max-w-none text-slate-600">
            {language === 'es' ? (
              <>
                <p className="mb-4">
                  Mi filosofía docente se fundamenta en la <strong>inclusión tecnológica</strong> y el <strong>aprendizaje significativo</strong>. 
                  Creo que la tecnología debe ser una herramienta para empoderar a todos los estudiantes, sin importar sus capacidades o contexto.
                </p>
                <p className="mb-4">
                  Promuevo el <strong>aprendizaje basado en proyectos</strong>, donde los estudiantes desarrollan soluciones tecnológicas 
                  para problemas reales, especialmente aquellos relacionados con la <strong>accesibilidad</strong> y la <strong>salud</strong>. 
                  Integro el pensamiento computacional como una competencia transversal esencial.
                </p>
                <p className="mb-4">
                  Me apasiona formar profesionales que no solo dominen la tecnología, sino que la utilicen con <strong>responsabilidad social</strong>, 
                  desarrollando aplicaciones que mejoren la calidad de vida de personas con autismo, adultos mayores y comunidades vulnerables.
                </p>
                <p>
                  Fomento la <strong>investigación colaborativa</strong> y la publicación científica, preparando a mis estudiantes para contribuir 
                  al avance del conocimiento en ciencias de la computación con impacto humano.
                </p>
              </>
            ) : (
              <>
                <p className="mb-4">
                  My teaching philosophy is based on <strong>technological inclusion</strong> and <strong>meaningful learning</strong>. 
                  I believe technology should be a tool to empower all students, regardless of their abilities or context.
                </p>
                <p className="mb-4">
                  I promote <strong>project-based learning</strong>, where students develop technological solutions 
                  for real problems, especially those related to <strong>accessibility</strong> and <strong>healthcare</strong>. 
                  I integrate computational thinking as an essential cross-cutting competency.
                </p>
                <p className="mb-4">
                  I am passionate about training professionals who not only master technology but use it with <strong>social responsibility</strong>, 
                  developing applications that improve the quality of life for people with autism, elderly adults, and vulnerable communities.
                </p>
                <p>
                  I encourage <strong>collaborative research</strong> and scientific publication, preparing my students to contribute 
                  to the advancement of knowledge in computer science with human impact.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}