import React, { useState, useEffect, useCallback } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Mail, Linkedin, ExternalLink, Star, Users, X, Send, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "../shared/LanguageContext";

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80";

export default function ResearchTeamCarousel() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: researchers = [], isLoading } = useQuery({
    queryKey: ['researchers'],
    queryFn: () => contentClient.entities.Researcher.list('order')
  });

  // Auto-advance carousel solo si hay más de 1 researcher
  useEffect(() => {
    if (researchers.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % researchers.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [researchers.length]);

  const goToPrev = useCallback(() => {
    if (researchers.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + researchers.length) % researchers.length);
  }, [researchers.length]);

  const goToNext = useCallback(() => {
    if (researchers.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % researchers.length);
  }, [researchers.length]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    
    await contentClient.entities.ContactMessage.create({
      name: emailForm.name,
      email: emailForm.email,
      subject: `[Para: ${currentResearcher?.name}] ${emailForm.subject}`,
      message: emailForm.message
    });

    setSending(false);
    setSent(true);
    setTimeout(() => {
      setEmailModalOpen(false);
      setSent(false);
      setEmailForm({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Si no hay researchers, no renderizamos nada
  if (researchers.length === 0) {
    return null;
  }

  // Todos los investigadores ordenados (principales primero)
  const allResearchers = [...researchers].sort((a, b) => {
    if (a.is_principal && !b.is_principal) return -1;
    if (!a.is_principal && b.is_principal) return 1;
    return (a.order || 0) - (b.order || 0);
  });
  
  const currentResearcher = allResearchers[currentIndex];

  return (
    <section className="mb-16">
      {/* Header elegante */}
      <div className="relative mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#f4d03f] rounded-2xl shadow-lg shadow-[#D4AF37]/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-[#0A2540]">
                {language === 'es' ? 'Grupo de Investigación' : 'Research Group'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {language === 'es' ? 'Colaboradores y equipo de trabajo' : 'Collaborators and team members'}
              </p>
            </div>
          </div>
          
          {/* Navigation arrows */}
          {allResearchers.length > 4 && (
            <div className="hidden md:flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrev}
                className="rounded-full border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]"
              >
                <ChevronLeft className="w-5 h-5 text-[#D4AF37]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="rounded-full border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]"
              >
                <ChevronRight className="w-5 h-5 text-[#D4AF37]" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Carousel de investigadores - estilo elegante con foto a la izquierda */}
      <div className="relative">
        {/* Card principal del investigador actual */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
          <div className="flex flex-col lg:flex-row">
            {/* Foto grande a la izquierda */}
            <div className="lg:w-2/5 relative">
              <div className="h-72 lg:h-[420px] overflow-hidden bg-slate-200">
                <img 
                  src={currentResearcher?.photo || DEFAULT_PHOTO} 
                  alt={currentResearcher?.name || "Investigador"}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Badge principal */}
              {currentResearcher?.is_principal && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#f4d03f] text-white border-0 shadow-lg px-4 py-1.5 text-sm font-semibold">
                    <Star className="w-4 h-4 mr-1.5 fill-white" />
                    {language === 'es' ? 'Líder de Grupo' : 'Group Leader'}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Información a la derecha */}
            <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
              {/* Nombre y título */}
              <div className="mb-6">
                <h3 className="text-3xl lg:text-4xl font-serif font-bold text-[#0A2540] mb-3">
                  {currentResearcher?.name || ""}
                </h3>
                <p className="text-xl text-[#D4AF37] font-semibold">
                  {language === 'en' && currentResearcher?.title_en 
                    ? currentResearcher.title_en 
                    : currentResearcher?.title || ""}
                </p>
              </div>
              
              {/* Especialidad */}
              {currentResearcher?.specialty && (
                <div className="mb-4">
                  <p className="text-slate-600 leading-relaxed">
                    {language === 'en' && currentResearcher?.specialty_en 
                      ? currentResearcher.specialty_en 
                      : currentResearcher.specialty}
                  </p>
                </div>
              )}
              
              {/* Bio */}
              {currentResearcher?.bio && (
                <div className="mb-6">
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {language === 'en' && currentResearcher?.bio_en 
                      ? currentResearcher.bio_en 
                      : currentResearcher.bio}
                  </p>
                </div>
              )}
              
              {/* Institución */}
              {currentResearcher?.institution && (
                <div className="flex items-center gap-2 mb-8 text-slate-400">
                  <div className="w-1 h-4 bg-[#D4AF37] rounded-full"></div>
                  <span className="text-sm font-medium">{currentResearcher.institution}</span>
                </div>
              )}
              
              {/* Social links elegantes */}
              <div className="flex flex-wrap gap-3">
                {currentResearcher?.email && (
                  <button 
                    onClick={() => setEmailModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A2540] text-white hover:bg-[#0A2540]/80 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                )}
                {currentResearcher?.linkedin && (
                  <a 
                    href={currentResearcher.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0077b5] text-white hover:bg-[#0077b5]/80 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                )}
                {currentResearcher?.researchgate && (
                  <a 
                    href={currentResearcher.researchgate} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00d0af] text-white hover:bg-[#00d0af]/80 transition-all shadow-lg hover:shadow-xl"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-medium">ResearchGate</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnails de navegación - solo si hay más de 1 */}
        {allResearchers.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrev}
              className="rounded-full bg-white shadow-md hover:shadow-lg hover:bg-[#D4AF37]/10 border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5 text-[#0A2540]" />
            </Button>
            
            <div className="flex gap-3 overflow-x-auto max-w-md py-2">
              {allResearchers.map((researcher, i) => (
                <button
                  key={researcher.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                    i === currentIndex 
                      ? 'border-[#D4AF37] scale-110 shadow-lg' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  <img 
                    src={researcher.photo || DEFAULT_PHOTO} 
                    alt={researcher.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="rounded-full bg-white shadow-md hover:shadow-lg hover:bg-[#D4AF37]/10 border border-slate-200"
            >
              <ChevronRight className="w-5 h-5 text-[#0A2540]" />
            </Button>
          </div>
        )}
      </div>

      {/* Modal para enviar email */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0A2540]">
              <Mail className="w-5 h-5 text-[#D4AF37]" />
              {language === 'es' ? 'Enviar mensaje a' : 'Send message to'} {currentResearcher?.name}
            </DialogTitle>
          </DialogHeader>
          
          {sent ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-700">
                {language === 'es' ? '¡Mensaje enviado!' : 'Message sent!'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <Input
                  placeholder={language === 'es' ? 'Tu nombre' : 'Your name'}
                  value={emailForm.name}
                  onChange={(e) => setEmailForm({...emailForm, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder={language === 'es' ? 'Tu email' : 'Your email'}
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder={language === 'es' ? 'Asunto' : 'Subject'}
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder={language === 'es' ? 'Tu mensaje...' : 'Your message...'}
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'es' ? 'Enviando...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Enviar mensaje' : 'Send message'}
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </section>
  );
}