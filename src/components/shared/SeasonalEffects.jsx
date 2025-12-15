import React, { useEffect, useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";

// Snowflake component for Christmas
const Snowflake = ({ style }) => (
  <div className="snowflake dark:text-white" style={style}>❄</div>
);

// Ghost component for Halloween
const Ghost = ({ style }) => (
  <div className="ghost dark:text-white" style={style}>👻</div>
);

// Heart component for Valentine's
const HeartFloat = ({ style }) => (
  <div className="heart-float dark:text-white" style={style}>💕</div>
);

// Flower component for Spring
const Flower = ({ style }) => (
  <div className="flower dark:text-white" style={style}>🌸</div>
);

// Confetti component for Independence
const Confetti = ({ style }) => (
  <div className="confetti dark:text-white" style={style}>{Math.random() > 0.5 ? '🎊' : '✨'}</div>
);

// Mexican Flag component
const MexicanFlag = ({ className }) => (
  <div className={`flex ${className}`}>
    <div className="w-3 h-5 bg-green-600 rounded-l-sm"></div>
    <div className="w-3 h-5 bg-white"></div>
    <div className="w-3 h-5 bg-red-600 rounded-r-sm"></div>
  </div>
);

export default function SeasonalEffects() {
  const [elements, setElements] = useState([]);

  const { data: settings = [] } = useQuery({
    queryKey: ['seasonal-theme'],
    queryFn: () => contentClient.entities.SiteSettings.filter({ key: 'seasonal_theme' })
  });

  const currentTheme = settings.find(s => s.key === 'seasonal_theme')?.value || 'none';

  useEffect(() => {
    if (currentTheme === 'none') {
      setElements([]);
      return;
    }

    // Generate random elements
    const generateElements = () => {
      const newElements = [];
      const count = currentTheme === 'christmas' ? 25 : 15;
      
      for (let i = 0; i < count; i++) {
        newElements.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 10,
          duration: 5 + Math.random() * 10,
          size: 0.8 + Math.random() * 0.8
        });
      }
      setElements(newElements);
    };

    generateElements();
  }, [currentTheme]);

  if (currentTheme === 'none' || elements.length === 0) return null;

  const renderElement = (el) => {
    const style = {
      left: `${el.left}%`,
      animationDelay: `${el.delay}s`,
      animationDuration: `${el.duration}s`,
      fontSize: `${el.size}rem`
    };

    switch (currentTheme) {
      case 'christmas':
        return <Snowflake key={el.id} style={style} />;
      case 'halloween':
        return <Ghost key={el.id} style={style} />;
      case 'valentines':
        return <HeartFloat key={el.id} style={style} />;
      case 'spring':
        return <Flower key={el.id} style={style} />;
      case 'independence':
        return <Confetti key={el.id} style={style} />;
      default:
        return null;
    }
  };

  const getDecorations = () => {
    switch (currentTheme) {
      case 'christmas':
        return (
          <>
            {/* Snowman in corner */}
            <div className="fixed bottom-4 left-4 text-6xl opacity-80 animate-bounce z-40 pointer-events-none hidden md:block">⛄</div>
            {/* Christmas tree */}
            <div className="fixed bottom-4 right-4 text-5xl opacity-80 z-40 pointer-events-none hidden md:block">🎄</div>
            {/* Lights garland at top */}
            <div className="fixed top-16 left-0 right-0 flex justify-center gap-4 text-2xl z-40 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="christmas-light" style={{ animationDelay: `${i * 0.2}s` }}>
                  {i % 3 === 0 ? '🔴' : i % 3 === 1 ? '🟢' : '🟡'}
                </span>
              ))}
            </div>
          </>
        );
      case 'halloween':
        return (
          <>
            {/* Pumpkins */}
            <div className="fixed bottom-4 left-4 text-5xl opacity-90 z-40 pointer-events-none hidden md:block animate-pulse">🎃</div>
            <div className="fixed bottom-4 right-4 text-4xl opacity-80 z-40 pointer-events-none hidden md:block">🦇</div>
            {/* Spider web */}
            <div className="fixed top-20 right-4 text-4xl opacity-60 z-40 pointer-events-none hidden md:block">🕸️</div>
          </>
        );
      case 'valentines':
        return (
          <>
            <div className="fixed bottom-4 left-4 text-5xl opacity-80 z-40 pointer-events-none hidden md:block animate-pulse">💝</div>
            <div className="fixed bottom-4 right-4 text-4xl opacity-80 z-40 pointer-events-none hidden md:block">🌹</div>
          </>
        );
      case 'spring':
        return (
          <>
            <div className="fixed bottom-4 left-4 text-5xl opacity-80 z-40 pointer-events-none hidden md:block">🦋</div>
            <div className="fixed bottom-4 right-4 text-4xl opacity-80 z-40 pointer-events-none hidden md:block">🌻</div>
          </>
        );
      case 'independence':
        return (
          <>
            <div className="fixed bottom-4 left-4 text-5xl opacity-80 z-40 pointer-events-none hidden md:block">🎆</div>
            <div className="fixed bottom-4 right-4 text-4xl opacity-80 z-40 pointer-events-none hidden md:block">🎉</div>
            <div className="fixed top-20 left-4 z-40 pointer-events-none hidden md:block opacity-90">
              <MexicanFlag className="scale-150" />
            </div>
            <div className="fixed top-20 right-4 z-40 pointer-events-none hidden md:block opacity-90">
              <MexicanFlag className="scale-150" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        .snowflake, .ghost, .heart-float, .flower, .confetti {
          position: fixed;
          top: -20px;
          z-index: 50;
          pointer-events: none;
          animation: fall linear infinite;
        }
        
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }
        
        .ghost {
          animation: ghostFloat linear infinite;
        }
        
        @keyframes ghostFloat {
          0% {
            transform: translateY(-20px) translateX(0);
            opacity: 0.8;
          }
          50% {
            transform: translateY(50vh) translateX(20px);
          }
          100% {
            transform: translateY(100vh) translateX(-20px);
            opacity: 0.2;
          }
        }
        
        .heart-float {
          animation: heartFloat ease-in-out infinite;
        }
        
        @keyframes heartFloat {
          0% {
            transform: translateY(-20px) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translateY(50vh) scale(1.2);
          }
          100% {
            transform: translateY(100vh) scale(0.8);
            opacity: 0.3;
          }
        }
        
        .christmas-light {
          animation: twinkle 1s ease-in-out infinite alternate;
        }
        
        @keyframes twinkle {
          0% { opacity: 0.4; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
      
      <div className="seasonal-effects">
        {elements.map(renderElement)}
        {getDecorations()}
      </div>
    </>
  );
}