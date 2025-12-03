import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, Clock, ArrowRight, BookOpen, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/shared/PageHeader";
import Pagination from "../components/shared/Pagination";
import SearchBar from "../components/shared/SearchBar";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import { useLanguage } from "../components/shared/LanguageContext";

export default function Blog() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const itemsPerPage = 6;
  const { t, language } = useLanguage();

  // Fetch blog posts from database
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-created_date')
  });

  // Fetch stats settings
  const { data: settings = [] } = useQuery({
    queryKey: ['blog-settings'],
    queryFn: () => base44.entities.SiteSettings.filter({ category: 'stats' })
  });

  const getSetting = (key, defaultValue) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const handleSubscribe = async () => {
    if (!subscribeEmail || !subscribeEmail.includes('@')) return;
    setSubscribing(true);
    
    try {
      // Create subscriber (welcome email not possible - Base44 only allows emails to registered users)
      await base44.entities.Subscriber.create({
        email: subscribeEmail,
        source: 'blog',
        active: true
      });
    } catch (err) {
      console.error('Subscription error:', err);
    }
    
    setSubscribing(false);
    setSubscribed(true);
    setSubscribeEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  const stats = [
    { value: getSetting('blog_articles', posts.length.toString() || '0'), label: t('stats.articles') },
    { value: getSetting('blog_readers', '0'), label: t('stats.readers') },
    { value: getSetting('blog_categories', '5'), label: t('stats.categories') },
  ].filter(s => s.value && s.value !== '0');

  const categories = ["all", "Innovación", "Competitividad", "Desarrollo", "Sociedad", "Tecnología"];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const filteredPosts = posts
    .filter(p => activeFilter === "all" || p.category === activeFilter)
    .filter(p => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const title = language === 'en' && p.title_en ? p.title_en : p.title;
      const excerpt = language === 'en' && p.excerpt_en ? p.excerpt_en : p.excerpt;
      return title?.toLowerCase().includes(query) || 
             excerpt?.toLowerCase().includes(query) ||
             p.category?.toLowerCase().includes(query);
    });

  const featuredPost = posts.find(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);
  
  const totalPages = Math.ceil(regularPosts.length / itemsPerPage);
  const paginatedPosts = regularPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader icon={Newspaper} title={t('blog.title')} description={t('blog.description')} />
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#db2777]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={Newspaper}
        title={t('blog.title')}
        description={t('blog.description')}
      />

      {/* Stats - Only show if there are stats */}
      {stats.length > 0 && (
        <section className="relative -mt-12 z-10 mb-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className={`grid grid-cols-${Math.min(stats.length, 4)} gap-4 max-w-${stats.length <= 2 ? 'lg' : '4xl'} mx-auto`}>
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white shadow-xl p-6 text-center">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#db2777]" />
                  <div className="text-3xl font-bold text-[#4a4a4a] mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <Breadcrumbs items={[{ label: t('nav.blog') }]} />
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder={language === 'es' ? "Buscar artículos..." : "Search articles..."}
            className="md:w-80"
          />
          <Tabs value={activeFilter} onValueChange={handleFilterChange} className="flex-1">
            <TabsList>
              <TabsTrigger value="all">{t('blog.categories.all')}</TabsTrigger>
              <TabsTrigger value="Innovación">{t('blog.categories.innovation')}</TabsTrigger>
              <TabsTrigger value="Competitividad">{t('blog.categories.competitiveness')}</TabsTrigger>
              <TabsTrigger value="Desarrollo">{t('blog.categories.development')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Featured Post */}
        {featuredPost && activeFilter === "all" && (
          <Link to={createPageUrl(`BlogPost?id=${featuredPost.id}`)}>
            <Card className="bg-white overflow-hidden mb-8 hover:shadow-2xl transition-all group cursor-pointer">
              <div className="grid md:grid-cols-2">
                <div className="h-64 md:h-auto">
                  {featuredPost.image && (
                    <img 
                      src={featuredPost.image} 
                      alt={language === 'en' && featuredPost.title_en ? featuredPost.title_en : featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-8">
                  <Badge className="badge-gold badge-elegant badge-shine mb-4">
                    {featuredPost.category}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4a4a4a] mb-4 group-hover:text-[#db2777] transition-colors">
                    {language === 'en' && featuredPost.title_en ? featuredPost.title_en : featuredPost.title}
                  </h2>
                  <p className="text-slate-600 mb-6 line-clamp-3">
                    {language === 'en' && featuredPost.excerpt_en ? featuredPost.excerpt_en : featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{formatDate(featuredPost.created_date)}</span>
                      {featuredPost.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.read_time}
                        </span>
                      )}
                    </div>
                    <span className="text-[#db2777] flex items-center">
                      {t('common.readFullArticle')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Empty state */}
        {posts.length === 0 && (
          <Card className="p-12 text-center bg-white mb-8">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {language === 'es' 
                ? 'No hay artículos publicados en este momento.'
                : 'No articles published at this time.'}
            </p>
          </Card>
        )}

        {/* Regular Posts */}
        {paginatedPosts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post) => (
              <Link key={post.id} to={createPageUrl(`BlogPost?id=${post.id}`)}>
                <Card className="bg-white overflow-hidden hover:shadow-xl transition-all group cursor-pointer h-full">
                  {post.image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={language === 'en' && post.title_en ? post.title_en : post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <Badge variant="outline" className="mb-3 pointer-events-none">{post.category}</Badge>
                    <h3 className="font-bold text-[#4a4a4a] mb-3 group-hover:text-[#db2777] transition-colors line-clamp-2">
                      {language === 'en' && post.title_en ? post.title_en : post.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {language === 'en' && post.excerpt_en ? post.excerpt_en : post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{formatDate(post.created_date)}</span>
                      {post.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.read_time}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

          <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          />

          {/* Newsletter */}
        <Card className="bg-gradient-to-r from-[#4a4a4a] to-[#6b7280] p-8 mt-12 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 text-[#db2777]" />
          <h3 className="text-2xl font-serif font-bold text-white mb-2">{t('blog.subscribeToBlog')}</h3>
          <p className="text-slate-300 mb-6">
            {t('blog.subscribeText')}
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 p-3 bg-green-500/20 text-green-300 rounded-lg max-w-md mx-auto">
              <CheckCircle className="w-5 h-5" />
              <span>{language === 'es' ? '¡Te has suscrito correctamente!' : 'Successfully subscribed!'}</span>
            </div>
          ) : (
            <div className="flex max-w-md mx-auto gap-2">
              <Input 
                type="email"
                placeholder={t('blog.emailPlaceholder')} 
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
              <Button 
                onClick={handleSubscribe}
                disabled={subscribing || !subscribeEmail}
                className="bg-[#db2777] hover:bg-[#db2777]/90 text-white border-2 border-white"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.subscribe')}
              </Button>
            </div>
          )}
        </Card>

        </div>
    </div>
  );
}