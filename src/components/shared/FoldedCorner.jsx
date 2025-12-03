import React, { useState } from "react";
import { Code2 } from "lucide-react";

export default function FoldedCorner() {
  const [isHovered, setIsHovered] = useState(false);

  const foldSize = isHovered ? 100 : 30;
  const foldColor = isHovered ? '#b8972e' : '#1a3a5c';
  const bgColor = '#0A2540';

  return (
    <div 
      className="absolute bottom-0 left-0 z-10 cursor-pointer"
      style={{ width: '120px', height: '120px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Crédito del desarrollador */}
      <div
        className="absolute flex flex-col items-center justify-center transition-all duration-500 ease-out"
        style={{
          bottom: '10px',
          left: '10px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scale(1)' : 'scale(0)',
          transitionDelay: isHovered ? '0.2s' : '0s',
          zIndex: 5,
        }}
      >
        {/* Icono con efecto de pulso */}
        <div 
          className="relative flex items-center justify-center rounded-lg mb-1"
          style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #c9a432 100%)',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.5)',
            animation: isHovered ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          }}
        >
          <Code2 
            className="text-white transition-transform duration-300" 
            style={{
              width: '20px',
              height: '20px',
              animation: isHovered ? 'spin-slow 3s linear infinite' : 'none',
            }}
          />
        </div>
        {/* Leyenda */}
        <span 
          className="text-[9px] font-medium text-[#D4AF37] whitespace-nowrap tracking-wide"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          By Fredy
        </span>
      </div>

      {/* El doblez de la página */}
      <div
        className="absolute transition-all duration-500 ease-out"
        style={{
          bottom: 0,
          left: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: `0 ${foldSize}px ${foldSize}px 0`,
          borderColor: `transparent ${foldColor} transparent transparent`,
          transform: 'rotate(180deg)',
          boxShadow: isHovered 
            ? '2px 2px 10px rgba(0, 0, 0, 0.4)' 
            : '1px 1px 3px rgba(0, 0, 0, 0.2)',
          zIndex: 2,
        }}
      />

      {/* El corte de la esquina */}
      <div
        className="absolute transition-all duration-500 ease-out"
        style={{
          bottom: 0,
          left: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: `${foldSize}px 0 0 ${foldSize}px`,
          borderColor: `transparent transparent transparent ${bgColor}`,
          zIndex: 1,
        }}
      />

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 15px rgba(212, 175, 55, 0.5); }
          50% { box-shadow: 0 4px 25px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.4); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}