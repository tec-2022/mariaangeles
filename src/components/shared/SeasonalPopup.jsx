import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageContext";

const SEASONAL_CONFIG = {
  christmas: {
    es: { title: "¡Feliz Navidad!", buttonText: "¡Gracias!" },
    en: { title: "Merry Christmas!", buttonText: "Thank you!" },
    emoji: "🎄",
    particles: ["❄️", "⭐", "🎁", "✨", "🔔"]
  },
  halloween: {
    es: { title: "¡Feliz Halloween!", buttonText: "¡Gracias!" },
    en: { title: "Happy Halloween!", buttonText: "Thank you!" },
    emoji: "🎃",
    particles: ["👻", "🦇", "🕷️", "💀", "🕸️"]
  },
  valentines: {
    es: { title: "¡Feliz Día del Amor!", buttonText: "¡Gracias!" },
    en: { title: "Happy Valentine's Day!", buttonText: "Thank you!" },
    emoji: "💕",
    particles: ["❤️", "💖", "💝", "💗", "✨"]
  },
  spring: {
    es: { title: "¡Bienvenida Primavera!", buttonText: "¡Gracias!" },
    en: { title: "Welcome Spring!", buttonText: "Thank you!" },
    emoji: "🌸",
    particles: ["🌷", "🦋", "🌼", "🌺", "🐝"]
  },
  independence: {
    es: { title: "¡Viva México!", buttonText: "¡Viva!" },
    en: { title: "Viva México!", buttonText: "Viva!" },
    emoji: "🇲🇽",
    particles: ["🎆", "🎇", "✨", "🎊", "🎉"]
  }
};

const THEME_STYLES = {
  christmas: {
    bg: "bg-gradient-to-br from-red-600 via-red-700 to-green-700",
    accent: "text-yellow-300",
    button: "bg-green-600 hover:bg-green-700"
  },
  halloween: {
    bg: "bg-gradient-to-br from-orange-500 via-orange-600 to-purple-800",
    accent: "text-yellow-300",
    button: "bg-purple-600 hover:bg-purple-700"
  },
  valentines: {
    bg: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500",
    accent: "text-pink-100",
    button: "bg-rose-600 hover:bg-rose-700"
  },
  spring: {
    bg: "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500",
    accent: "text-yellow-200",
    button: "bg-emerald-600 hover:bg-emerald-700"
  },
  independence: {
    bg: "bg-gradient-to-br from-green-600 via-white to-red-600",
    accent: "text-green-800",
    button: "bg-green-700 hover:bg-green-800"
  }
};

const AI_PROMPTS = {
  christmas: {
    es: "Genera un mensaje corto y cálido de Navidad (máximo 2 oraciones) de parte de una profesora universitaria investigadora. Debe ser inspirador y relacionado con el conocimiento, la investigación o la academia. Solo responde con el mensaje, sin comillas.",
    en: "Generate a short and warm Christmas message (max 2 sentences) from a university research professor. It should be inspiring and related to knowledge, research, or academia. Only respond with the message, no quotes."
  },
  halloween: {
    es: "Genera un mensaje corto y divertido de Halloween (máximo 2 oraciones) de parte de una profesora universitaria investigadora. Puede ser creativo y relacionado con el misterio del conocimiento o la innovación. Solo responde con el mensaje, sin comillas.",
    en: "Generate a short and fun Halloween message (max 2 sentences) from a university research professor. It can be creative and related to the mystery of knowledge or innovation. Only respond with the message, no quotes."
  },
  valentines: {
    es: "Genera un mensaje corto y emotivo para el Día del Amor (máximo 2 oraciones) de parte de una profesora universitaria investigadora. Debe hablar del amor por el conocimiento, la investigación o la educación. Solo responde con el mensaje, sin comillas.",
    en: "Generate a short and heartfelt Valentine's Day message (max 2 sentences) from a university research professor. It should speak about the love for knowledge, research, or education. Only respond with the message, no quotes."
  },
  spring: {
    es: "Genera un mensaje corto y optimista de bienvenida a la primavera (máximo 2 oraciones) de parte de una profesora universitaria investigadora. Debe relacionarse con el florecimiento de ideas y nuevos proyectos. Solo responde con el mensaje, sin comillas.",
    en: "Generate a short and optimistic spring welcome message (max 2 sentences) from a university research professor. It should relate to the blossoming of ideas and new projects. Only respond with the message, no quotes."
  },
  independence: {
    es: "Genera un mensaje corto y patriótico para las fiestas patrias mexicanas (máximo 2 oraciones) de parte de una profesora universitaria investigadora mexicana. Debe ser inspirador y relacionado con la identidad nacional y el progreso. Solo responde con el mensaje, sin comillas.",
    en: "Generate a short patriotic message for Mexican Independence Day (max 2 sentences) from a Mexican university research professor. It should be inspiring and related to national identity and progress. Only respond with the message, no quotes."
  }
};

export default function SeasonalPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [particles, setParticles] = useState([]);
  const { language } = useLanguage();

  const { data: settings = [] } = useQuery({
    queryKey: ['seasonal-theme-popup'],
    queryFn: () => base44.entities.SiteSettings.filter({ key: 'seasonal_theme' })
  });

  const currentTheme = settings.find(s => s.key === 'seasonal_theme')?.value || 'none';

  // Generate particles for effects
  useEffect(() => {
    if (currentTheme !== 'none' && SEASONAL_CONFIG[currentTheme]) {
      const config = SEASONAL_CONFIG[currentTheme];
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        emoji: config.particles[Math.floor(Math.random() * config.particles.length)],
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2
      }));
      setParticles(newParticles);
    }
  }, [currentTheme]);

  useEffect(() => {
    if (currentTheme === 'none') return;

    const storageKey = `seasonal_popup_${currentTheme}`;
    const lastShown = localStorage.getItem(storageKey);
    const today = new Date().toDateString();

    if (lastShown !== today) {
      // Generate AI message
      const generateMessage = async () => {
        try {
          const prompt = AI_PROMPTS[currentTheme]?.[language] || AI_PROMPTS[currentTheme]?.es;
          if (prompt) {
            const response = await base44.integrations.Core.InvokeLLM({
              prompt: prompt
            });
            setAiMessage(response);
          }
        } catch (error) {
          console.error("Error generating message:", error);
          setAiMessage(language === 'es' 
            ? "¡Te deseo lo mejor en esta temporada especial!" 
            : "Wishing you the best this special season!");
        } finally {
          setIsLoading(false);
        }
      };

      generateMessage();
      
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTheme, language]);

  const handleClose = () => {
    setIsVisible(false);
    const storageKey = `seasonal_popup_${currentTheme}`;
    localStorage.setItem(storageKey, new Date().toDateString());
  };

  if (!isVisible || currentTheme === 'none' || isLoading) return null;

  const config = SEASONAL_CONFIG[currentTheme];
  const styles = THEME_STYLES[currentTheme];
  
  if (!config || !styles) return null;

  const content = config[language] || config['es'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2); }
          50% { box-shadow: 0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .particle {
          position: absolute;
          animation: float-up linear infinite;
          pointer-events: none;
          font-size: 1.5rem;
        }
        .popup-card {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, pulse-glow 2s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
        }
      `}</style>

      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        >
          {p.emoji}
        </span>
      ))}

      <div className={`popup-card relative max-w-md w-full ${styles.bg} rounded-3xl shadow-2xl p-8 text-white text-center overflow-hidden`}>
        {/* Sparkle effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-4 left-8 w-6 h-6 text-white/40" style={{ animation: 'sparkle 1.5s ease-in-out infinite' }} />
          <Sparkles className="absolute top-12 right-6 w-4 h-4 text-white/30" style={{ animation: 'sparkle 2s ease-in-out infinite 0.5s' }} />
          <Sparkles className="absolute bottom-16 left-6 w-5 h-5 text-white/35" style={{ animation: 'sparkle 1.8s ease-in-out infinite 0.3s' }} />
          <Sparkles className="absolute bottom-8 right-10 w-4 h-4 text-white/25" style={{ animation: 'sparkle 2.2s ease-in-out infinite 0.7s' }} />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all hover:scale-110 hover:rotate-90 duration-300 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emoji with glow */}
        <div className="relative inline-block mb-4">
          <div className="text-7xl animate-bounce filter drop-shadow-lg">
            {config.emoji}
          </div>
          <div className="absolute inset-0 text-7xl blur-xl opacity-50">
            {config.emoji}
          </div>
        </div>

        {/* Title with shimmer */}
        <h2 className={`shimmer-text text-3xl font-serif font-bold mb-5 ${currentTheme === 'independence' ? 'text-green-800' : ''}`}>
          {content.title}
        </h2>

        {/* AI Generated Message */}
        <div className={`relative mb-6 p-4 rounded-2xl ${currentTheme === 'independence' ? 'bg-white/80' : 'bg-white/10'} backdrop-blur-sm`}>
          <p className={`text-lg leading-relaxed ${currentTheme === 'independence' ? 'text-gray-700' : 'text-white'}`}>
            "{aiMessage}"
          </p>
        </div>

        {/* Signature */}
        <p className={`text-sm mb-6 italic ${currentTheme === 'independence' ? 'text-gray-600' : 'text-white/80'}`}>
          — Dra. María de los Ángeles Quezada Cisnero
        </p>

        {/* Button with hover effect */}
        <Button
          onClick={handleClose}
          className={`${styles.button} text-white font-semibold px-10 py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
        >
          {content.buttonText}
        </Button>

        {/* Corner decorations */}
        {currentTheme === 'christmas' && (
          <>
            <div className="absolute -top-3 -left-3 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎅</div>
            <div className="absolute -bottom-3 -right-3 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎁</div>
          </>
        )}
        {currentTheme === 'halloween' && (
          <>
            <div className="absolute -top-3 -right-3 text-4xl" style={{ animation: 'sparkle 2s ease-in-out infinite' }}>👻</div>
            <div className="absolute -bottom-3 -left-3 text-3xl" style={{ animation: 'sparkle 2.5s ease-in-out infinite 0.3s' }}>🦇</div>
          </>
        )}
        {currentTheme === 'valentines' && (
          <>
            <div className="absolute -top-2 -left-2 text-3xl animate-pulse">❤️</div>
            <div className="absolute -top-2 -right-2 text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>💖</div>
            <div className="absolute -bottom-2 -right-2 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>💝</div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse" style={{ animationDelay: '0.7s' }}>💗</div>
          </>
        )}
        {currentTheme === 'spring' && (
          <>
            <div className="absolute -top-2 -left-2 text-3xl" style={{ animation: 'sparkle 2s ease-in-out infinite' }}>🦋</div>
            <div className="absolute -top-2 -right-2 text-2xl" style={{ animation: 'sparkle 2.3s ease-in-out infinite 0.2s' }}>🌷</div>
            <div className="absolute -bottom-2 -right-2 text-3xl" style={{ animation: 'sparkle 1.8s ease-in-out infinite 0.4s' }}>🌼</div>
          </>
        )}
        {currentTheme === 'independence' && (
          <>
            <div className="absolute -top-3 -left-3 text-3xl" style={{ animation: 'sparkle 1.5s ease-in-out infinite' }}>🎆</div>
            <div className="absolute -top-3 -right-3 text-3xl" style={{ animation: 'sparkle 1.5s ease-in-out infinite 0.5s' }}>🎇</div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-3xl animate-bounce">🦅</div>
          </>
        )}
      </div>
    </div>
  );
}