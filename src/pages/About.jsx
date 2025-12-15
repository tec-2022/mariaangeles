import React from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, BookOpen, Award, TrendingUp, Building, Download, Globe, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import { useLanguage } from "../components/shared/LanguageContext";

export default function About() {
  const { t, language } = useLanguage();

  // Fetch profile settings from database
  const { data: settings = [] } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: () => contentClient.entities.SiteSettings.list()
  });

  // Fetch about content from database
  const { data: aboutContent = [], isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: () => contentClient.entities.AboutContent.list('order')
  });

  // Fetch real publication count from database
  const { data: publications = [] } = useQuery({
    queryKey: ['about-publications-count'],
    queryFn: () => contentClient.entities.Publication.list()
  });

  // Fetch institutions count
  const { data: institutions = [] } = useQuery({
    queryKey: ['about-institutions-count'],
    queryFn: () => contentClient.entities.Institution.filter({ visible: true })
  });

  // Fetch certificates/recognitions count
  const { data: certificates = [] } = useQuery({
    queryKey: ['about-certificates-count'],
    queryFn: () => contentClient.entities.Certificate.filter({ visible: true })
  });

  const getSetting = (key, defaultValue = "") => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const profilePhoto = getSetting('profile_photo', '');
  const cvUrl = getSetting('cv_url');

  // Calculate real stats from database
  const publicationCount = publications.length;
  const institutionCount = institutions.length || parseInt(getSetting('institutions', '3'));
  const recognitionCount = certificates.length || parseInt(getSetting('recognitions', '15'));

  const stats = [
    { icon: GraduationCap, value: getSetting('years_experience', '25+'), label: t('stats.yearsExperience') },
    { icon: BookOpen, value: publicationCount > 0 ? `${publicationCount}+` : getSetting('publications', '50+'), label: t('stats.publications') },
    { icon: Award, value: recognitionCount > 0 ? `${recognitionCount}+` : '15+', label: t('stats.recognitions') },
    { icon: TrendingUp, value: institutionCount > 0 ? `${institutionCount}` : '3', label: t('stats.institutions') },
  ];

  // Get content by section
  const getSection = (sectionName) => {
    return aboutContent.filter(item => item.section === sectionName);
  };

  const positions = getSection('position');
  const positionsInternational = getSection('position_international');
  const education = getSection('education');
  const continuingEd = getSection('continuing_education');
  const awards = getSection('honor');

  const specialties = [
    t('about.specialties.knowledgeEconomy'),
    t('about.specialties.regionalDevelopment'),
    t('about.specialties.innovationEcosystems'),
    t('about.specialties.territorialCompetitiveness')
  ];

  const sectionIcons = {
    position: Briefcase,
    position_international: Globe,
    education: GraduationCap,
    continuing_education: BookOpen,
    honor: Award
  };

  const sectionBadges = {
    position: { label: language === 'es' ? 'Académico' : 'Academic', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    position_international: { label: language === 'es' ? 'Internacional' : 'International', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    education: { label: language === 'es' ? 'Grado' : 'Degree', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    continuing_education: { label: language === 'es' ? 'Formación' : 'Training', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    honor: { label: language === 'es' ? 'Reconocimiento' : 'Recognition', color: 'bg-amber-100 text-amber-800 border-amber-200' }
  };

  const renderSection = (title, items, section, showDescription = false) => {
    const Icon = sectionIcons[section] || BookOpen;
    const badgeInfo = sectionBadges[section];
    
    if (items.length === 0) return null;
    
    return (
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1 h-12 rounded-full bg-[#db2777]"></div>
          <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <Card key={item.id || index} className="bg-white p-6 hover:shadow-xl transition-all relative">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {item.is_current && (
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs pointer-events-none">
                    {t('common.current')}
                  </Badge>
                )}
                {badgeInfo && (
                  <Badge className={`${badgeInfo.color} text-xs pointer-events-none`}>
                    {badgeInfo.label}
                  </Badge>
                )}
                {item.period && (
                  <span className="text-xs text-slate-400 font-medium">{item.period}</span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-[#4a4a4a] mb-2">
                    {language === 'en' && item.title_en ? item.title_en : item.title}
                  </h3>
                  {item.institution && <p className="text-slate-600 text-sm">{item.institution}</p>}
                  {showDescription && item.description && (
                    <p className="text-slate-500 text-xs mt-2">
                      {language === 'en' && item.description_en ? item.description_en : item.description}
                    </p>
                  )}
                </div>
                <Icon className="w-8 h-8 text-slate-200 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4a4a4a] via-[#6b7280] to-[#4a4a4a] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="badge-gold badge-elegant badge-shine mb-4">
                <Award className="w-3 h-3 mr-1" />
                {t('about.role')}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
                {t('about.title')}
              </h1>
              <div className="w-20 h-1 bg-[#db2777] mb-6"></div>
              <p className="text-xl text-slate-300 mb-6">
                {t('about.bio')}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="border-white/30 text-white bg-white/5 pointer-events-none">
                    {specialty}
                  </Badge>
                ))}
              </div>
              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#db2777] hover:bg-[#be185d] text-white">
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Descargar CV' : 'Download CV'}
                  </Button>
                </a>
              )}
            </div>
            {profilePhoto && (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    <img 
                      src={profilePhoto} 
                      alt="Dra. María de los Ángeles Quezada Cisnero"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#db2777] rounded-full flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-10 mb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white shadow-xl hover:shadow-2xl transition-all p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-[#db2777]" />
                <div className="text-3xl font-bold text-[#4a4a4a] mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-16">
        <Breadcrumbs items={[{ label: t('nav.about') }]} />
        
        {/* Academic Positions */}
        {renderSection(t('about.academicPositions'), positions, 'position')}

        {/* International Academic Positions */}
        {renderSection(
          language === 'es' ? 'Posiciones Académicas Internacionales' : 'International Academic Positions', 
          positionsInternational, 
          'position_international'
        )}

        {/* Education */}
        {renderSection(t('about.education'), education, 'education')}

        {/* Continuing Education */}
        {renderSection(t('about.continuingEducation'), continuingEd, 'continuing_education')}

        {/* Honors and Awards */}
        {renderSection(t('about.honorsAndAwards'), awards, 'honor', true)}

        {/* Empty state if no content */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#db2777] border-t-transparent rounded-full"></div>
          </div>
        )}

        {!isLoading && aboutContent.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {language === 'es' 
                ? 'El contenido se mostrará aquí una vez que se agregue desde el panel de administración.'
                : 'Content will be displayed here once added from the admin panel.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}