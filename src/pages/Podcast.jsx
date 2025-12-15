import React, { useState, useRef } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { Mic, Headphones, Clock, Play, Pause, ExternalLink, Volume2, SkipBack, SkipForward } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import PageHeader from "../components/shared/PageHeader";
import SearchBar from "../components/shared/SearchBar";
import ContentModal from "../components/shared/ContentModal";
import Breadcrumbs from "../components/shared/Breadcrumbs";
import { useLanguage } from "../components/shared/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Podcast() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [playingEpisode, setPlayingEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Fetch episodes from database
  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['podcast-episodes'],
    queryFn: () => contentClient.entities.PodcastEpisode.filter({ published: true }, '-episode_number')
  });

  // Fetch settings for stats
  const { data: settings = [] } = useQuery({
    queryKey: ['podcast-settings'],
    queryFn: () => contentClient.entities.SiteSettings.filter({ category: 'stats' })
  });

  const getSetting = (key, defaultValue) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const stats = [
    { value: getSetting('podcast_listeners', ''), label: t('stats.listeners') },
    { value: episodes.length > 0 ? episodes.length.toString() : '', label: t('stats.episodes') },
  ].filter(s => s.value);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const latestEpisode = episodes.length > 0 ? episodes[0] : null;
  const otherEpisodes = episodes.slice(1);

  const handlePlayEpisode = (episode) => {
    if (playingEpisode?.id === episode.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setPlayingEpisode(episode);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const platforms = [
    { name: "Apple Podcasts", key: "podcast_apple_url" },
    { name: "Spotify", key: "podcast_spotify_url" },
    { name: "YouTube", key: "podcast_youtube_url" },
  ].map(p => ({ ...p, url: getSetting(p.key, '') })).filter(p => p.url);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4a4a4a] via-[#6b7280] to-[#4a4a4a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#db2777] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-pink-50/30">
      {/* Hidden Audio Player */}
      {playingEpisode?.audio_url && (
        <audio
          ref={audioRef}
          src={playingEpisode.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          autoPlay
        />
      )}

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#4a4a4a] via-[#6b7280] to-[#4a4a4a] py-20 md:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#db2777] blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-[#ec4899] blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-purple-500 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Sound wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-20">
          <svg viewBox="0 0 1200 100" className="w-full h-full fill-[#db2777]">
            <path d="M0,50 Q150,0 300,50 T600,50 T900,50 T1200,50 L1200,100 L0,100 Z" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#db2777] to-[#ec4899] flex items-center justify-center shadow-lg shadow-[#db2777]/30">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-medium">{t('podcast.title')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
              {t('podcast.subtitle')}
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              {t('podcast.description')}
            </p>
            
            {/* Stats inline */}
            {stats.length > 0 && (
              <div className="flex justify-center gap-8 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-[#db2777]">{stat.value}</div>
                    <div className="text-sm text-slate-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-4">
              {latestEpisode && (
                <Button 
                  onClick={() => handlePlayEpisode(latestEpisode)}
                  className="bg-[#db2777] hover:bg-[#db2777]/90 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-[#db2777]/30 hover:shadow-xl hover:shadow-[#db2777]/40 transition-all"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t('podcast.latestEpisode')}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <Breadcrumbs items={[{ label: t('nav.podcast') }]} />
        
        {/* Latest Episode - Featured */}
        {latestEpisode && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1.5 shadow-lg shadow-green-500/30">
                🎙️ {language === 'es' ? 'Nuevo Episodio' : 'New Episode'}
              </Badge>
            </div>

            <Card className="bg-white overflow-hidden hover:shadow-2xl transition-all border-0 shadow-xl rounded-3xl">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 relative group">
                  {latestEpisode.image ? (
                    <img 
                      src={latestEpisode.image} 
                      alt={language === 'en' && latestEpisode.title_en ? latestEpisode.title_en : latestEpisode.title}
                      className="w-full h-72 md:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-72 md:h-full bg-gradient-to-br from-[#db2777] to-[#ec4899] flex items-center justify-center">
                      <Mic className="w-20 h-20 text-white/50" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handlePlayEpisode(latestEpisode)}
                      className="w-20 h-20 rounded-full bg-[#db2777] flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      {playingEpisode?.id === latestEpisode.id && isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="md:col-span-3 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="bg-[#db2777]/10 text-[#db2777] border-[#db2777]/20">
                        {language === 'es' ? 'Episodio' : 'Episode'} {latestEpisode.episode_number}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {latestEpisode.duration}
                      </span>
                      <span className="text-sm text-slate-400">{formatDate(latestEpisode.date)}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#4a4a4a] mb-3">
                      {language === 'en' && latestEpisode.title_en ? latestEpisode.title_en : latestEpisode.title}
                    </h2>
                    {latestEpisode.guest_name && (
                      <p className="text-[#db2777] font-medium mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[#db2777]/10 flex items-center justify-center">
                          <Headphones className="w-4 h-4 text-[#db2777]" />
                        </span>
                        {t('podcast.withGuest')} {latestEpisode.guest_name}
                        {latestEpisode.guest_title && ` - ${latestEpisode.guest_title}`}
                      </p>
                    )}
                    <p className="text-slate-600 leading-relaxed">
                      {language === 'en' && latestEpisode.description_en ? latestEpisode.description_en : latestEpisode.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                    <Button 
                      onClick={() => handlePlayEpisode(latestEpisode)}
                      className="bg-[#db2777] hover:bg-[#db2777]/90 text-white rounded-full px-6 shadow-lg shadow-[#db2777]/30"
                    >
                      {playingEpisode?.id === latestEpisode.id && isPlaying ? (
                        <><Pause className="w-4 h-4 mr-2" /> {language === 'es' ? 'Pausar' : 'Pause'}</>
                      ) : (
                        <><Play className="w-4 h-4 mr-2" /> {t('common.listenNow')}</>
                      )}
                    </Button>
                    {latestEpisode.spotify_url && (
                      <a href={latestEpisode.spotify_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="rounded-full border-slate-200">
                          Spotify
                        </Button>
                      </a>
                    )}
                    {latestEpisode.youtube_url && (
                      <a href={latestEpisode.youtube_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="rounded-full border-slate-200">
                          YouTube
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.section>
        )}

        {/* All Episodes */}
        {otherEpisodes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#db2777] to-[#ec4899] flex items-center justify-center shadow-lg shadow-[#db2777]/20">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#4a4a4a]">{t('podcast.allEpisodes')}</h2>
              </div>
              <Badge className="bg-slate-100 text-slate-600">
                {otherEpisodes.length} {language === 'es' ? 'episodios' : 'episodes'}
              </Badge>
            </div>

            <SearchBar 
              onSearch={setSearchQuery} 
              placeholder={language === 'es' ? "Buscar episodios..." : "Search episodes..."}
              className="mb-8 max-w-md"
            />

            <div className="grid md:grid-cols-2 gap-6">
              {otherEpisodes
                .filter(ep => !searchQuery || 
                  (ep.title && ep.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (ep.guest_name && ep.guest_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (ep.description && ep.description.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((episode, idx) => (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className={`bg-white overflow-hidden hover:shadow-xl transition-all cursor-pointer group rounded-2xl border-0 shadow-md ${
                      playingEpisode?.id === episode.id ? 'ring-2 ring-[#db2777] shadow-lg shadow-[#db2777]/10' : ''
                    }`}
                    onClick={() => setSelectedEpisode(episode)}
                  >
                    <div className="flex">
                      <div className="relative w-28 h-28 flex-shrink-0">
                        {episode.image ? (
                          <img 
                            src={episode.image} 
                            alt={language === 'en' && episode.title_en ? episode.title_en : episode.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#db2777]/20 to-[#ec4899]/20 flex items-center justify-center">
                            <Mic className="w-8 h-8 text-[#db2777]/50" />
                          </div>
                        )}
                        {/* Play button overlay */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePlayEpisode(episode); }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#db2777] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                            {playingEpisode?.id === episode.id && isPlaying ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </div>
                        </button>
                        {/* Playing indicator */}
                        {playingEpisode?.id === episode.id && isPlaying && (
                          <div className="absolute bottom-2 left-2 flex gap-0.5">
                            {[1, 2, 3].map(i => (
                              <div 
                                key={i} 
                                className="w-1 bg-[#db2777] rounded-full animate-pulse"
                                style={{ 
                                  height: `${8 + i * 4}px`,
                                  animationDelay: `${i * 0.1}s`
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#db2777]/10 text-[#db2777] border-0 text-xs">
                            Ep. {episode.episode_number}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            {episode.duration}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#4a4a4a] mb-1 line-clamp-1 group-hover:text-[#db2777] transition-colors">
                          {language === 'en' && episode.title_en ? episode.title_en : episode.title}
                        </h3>
                        {episode.guest_name && (
                          <p className="text-xs text-[#db2777] mb-1">
                            {t('podcast.withGuest')} {episode.guest_name}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {language === 'en' && episode.description_en ? episode.description_en : episode.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <ContentModal
              isOpen={!!selectedEpisode}
              onClose={() => setSelectedEpisode(null)}
              content={selectedEpisode}
              type="podcast"
            />
          </section>
        )}

        {/* Empty state */}
        {episodes.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <Mic className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {language === 'es' 
                ? 'No hay episodios publicados en este momento.'
                : 'No episodes published at this time.'}
            </p>
          </Card>
        )}

        {/* Subscribe */}
        {platforms.length > 0 && (
          <Card className="bg-gradient-to-br from-[#4a4a4a] via-[#6b7280] to-[#4a4a4a] p-10 text-center rounded-3xl border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#db2777] blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#ec4899] blur-3xl"></div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#db2777] to-[#ec4899] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#db2777]/30">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-white mb-3">{t('podcast.subscribeToPodcast')}</h3>
              <p className="text-slate-300 mb-8 max-w-md mx-auto">{t('podcast.subscribeText')}</p>
              <div className="flex justify-center gap-4 flex-wrap">
                {platforms.map((platform, index) => (
                  <a key={index} href={platform.url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {platform.name}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Floating Player */}
      <AnimatePresence>
        {playingEpisode && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-gradient-to-r from-[#4a4a4a] to-[#6b7280] border-t border-white/10 shadow-2xl">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-4">
                  {/* Episode info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                      {playingEpisode.image ? (
                        <img src={playingEpisode.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#db2777] to-[#ec4899] flex items-center justify-center">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                      <p className="text-white font-medium text-sm truncate">
                        {language === 'en' && playingEpisode.title_en ? playingEpisode.title_en : playingEpisode.title}
                      </p>
                      <p className="text-slate-400 text-xs truncate">
                        Ep. {playingEpisode.episode_number}
                        {playingEpisode.guest_name && ` • ${playingEpisode.guest_name}`}
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 15; }}
                      className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handlePlayEpisode(playingEpisode)}
                      className="w-12 h-12 rounded-full bg-[#db2777] hover:bg-[#db2777]/90 shadow-lg shadow-[#db2777]/40"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { if (audioRef.current) audioRef.current.currentTime += 15; }}
                      className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="hidden md:flex items-center gap-3 flex-1">
                    <span className="text-xs text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleSeek}
                      className="flex-1"
                    />
                    <span className="text-xs text-slate-400 w-10">{formatTime(duration)}</span>
                  </div>

                  {/* Volume */}
                  <div className="hidden lg:flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <Slider
                      defaultValue={[100]}
                      max={100}
                      step={1}
                      onValueChange={(v) => { if (audioRef.current) audioRef.current.volume = v[0] / 100; }}
                      className="w-20"
                    />
                  </div>

                  {/* Close */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setPlayingEpisode(null); setIsPlaying(false); }}
                    className="text-white/50 hover:text-white hover:bg-white/10 rounded-full ml-2"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}