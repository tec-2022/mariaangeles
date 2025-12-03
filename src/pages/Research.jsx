import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Globe, TrendingUp, Lightbulb, Target, BookOpen, Award, Users, Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "../components/shared/PageHeader";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import ResearchTeamCarousel from "../components/research/ResearchTeamCarousel";
import { useLanguage } from "../components/shared/LanguageContext";

export default function Research() {
  const { t, language } = useLanguage();

  // Fetch research projects from database
  const { data: projects = [] } = useQuery({
    queryKey: ['research-projects'],
    queryFn: () => base44.entities.ResearchProject.list('order')
  });

  // Fetch stats from settings
  const { data: settings = [] } = useQuery({
    queryKey: ['research-settings'],
    queryFn: () => base44.entities.SiteSettings.filter({ category: 'stats' })
  });

  // Fetch research lines from database
  const { data: researchLinesData = [] } = useQuery({
    queryKey: ['research-lines'],
    queryFn: () => base44.entities.ResearchLine.filter({ visible: true }, 'order')
  });

  const getSetting = (key, defaultValue) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const iconMap = { Globe, TrendingUp, Lightbulb, Target, BookOpen, Award, Users, Building };

  const researchLines = researchLinesData.map(line => ({
    icon: iconMap[line.icon] || Lightbulb,
    title: language === 'en' && line.title_en ? line.title_en : line.title,
    description: language === 'en' && line.description_en ? line.description_en : line.description,
    tags: (language === 'en' && line.tags_en ? line.tags_en : line.tags)?.split(',').map(t => t.trim()).filter(Boolean) || []
  }));

  const currentProjects = projects.filter(p => p.status === 'current');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const impactStats = [
    { value: getSetting('research_projects', '15+'), label: t('research.researchProjects') },
    { value: getSetting('publications', '50+'), label: t('research.scientificPublications') },
    { value: getSetting('citations', '1,200+'), label: t('stats.citations') },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={BookOpen}
        title={t('research.title')}
        description={t('research.description')}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <Breadcrumbs items={[{ label: t('nav.research') }]} />
        
        {/* Research Team Carousel - NEW SECTION */}
        <ResearchTeamCarousel />

        {/* Research Lines */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-12 rounded-full bg-[#db2777]"></div>
                              <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{t('research.researchLines')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {researchLines.map((line, index) => (
              <Card key={index} className="bg-white p-6 hover:shadow-xl transition-all border-l-4 border-l-[#db2777]">
                                    <div className="flex items-start gap-4">
                                      <div className="p-3 bg-[#db2777]/10 rounded-xl">
                                        <line.icon className="w-8 h-8 text-[#db2777]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#4a4a4a] mb-2">{line.title}</h3>
                    <p className="text-slate-600 mb-4">{line.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {line.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-slate-600 pointer-events-none">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Current Projects */}
        {currentProjects.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-[#db2777]"></div>
                                  <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{t('research.currentProjects')}</h2>
            </div>

            <div className="space-y-6">
              {currentProjects.map((project) => (
                <Card key={project.id} className="bg-white p-6 hover:shadow-xl transition-all">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-green-100 text-green-800 border-green-200 pointer-events-none">
                      {t('common.inProgress')}
                    </Badge>
                    <span className="text-sm text-slate-500 font-medium">{project.period}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#4a4a4a] mb-2">
                                            {language === 'en' && project.title_en ? project.title_en : project.title}
                                          </h3>
                  <p className="text-slate-600 mb-4">
                    {language === 'en' && project.description_en ? project.description_en : project.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {project.institution && (
                      <span className="text-slate-500">
                        {language === 'es' ? 'Institución' : 'Institution'}: 
                        <span className="text-[#4a4a4a] font-medium ml-1">{project.institution}</span>
                      </span>
                    )}
                    {project.funding && (
                      <span className="text-slate-500">
                        {language === 'es' ? 'Financiamiento' : 'Funding'}: 
                        <span className="text-[#db2777] font-medium ml-1">{project.funding}</span>
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 rounded-full bg-slate-300"></div>
              <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{t('research.completedProjects')}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {completedProjects.map((project) => (
                <Card key={project.id} className="bg-slate-50 p-6">
                  <Badge variant="outline" className="mb-4 pointer-events-none">{t('common.completed')}</Badge>
                  <h3 className="font-bold text-[#4a4a4a] mb-2">
                    {language === 'en' && project.title_en ? project.title_en : project.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-1">{project.period}</p>
                  <p className="text-sm text-slate-600">{project.institution}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Impact Stats */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-12 rounded-full bg-[#db2777]"></div>
                              <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{t('research.researchImpact')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {impactStats.map((stat, index) => (
              <Card key={index} className="bg-white p-8 text-center shadow-lg">
                <div className="text-4xl font-bold text-[#db2777] mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}