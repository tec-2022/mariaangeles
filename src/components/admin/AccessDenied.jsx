import React, { useState, useEffect } from "react";
import { ShieldX, Home, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";

export default function AccessDenied({ language = 'es' }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(createPageUrl("Home"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const texts = {
    es: {
      title: "Acceso Restringido",
      subtitle: "Área de Administración",
      message: "No tienes permisos para acceder a esta sección. Esta área está reservada únicamente para administradores y editores autorizados.",
      contact: "Si crees que deberías tener acceso, contacta al administrador del sitio.",
      redirecting: "Redirigiendo al inicio en",
      seconds: "segundos",
      goHome: "Ir al Inicio Ahora",
      logout: "Cerrar Sesión"
    },
    en: {
      title: "Access Restricted",
      subtitle: "Administration Area",
      message: "You don't have permission to access this section. This area is reserved for authorized administrators and editors only.",
      contact: "If you believe you should have access, please contact the site administrator.",
      redirecting: "Redirecting to home in",
      seconds: "seconds",
      goHome: "Go to Home Now",
      logout: "Log Out"
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#db2777]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4 ring-4 ring-red-500/20">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <p className="text-[#db2777] text-sm font-semibold uppercase tracking-wider mb-2">
            {t.subtitle}
          </p>
          <h1 className="text-3xl font-serif font-bold text-white mb-4">
            {t.title}
          </h1>
          <p className="text-slate-400 mb-4">
            {t.message}
          </p>
          <p className="text-slate-500 text-sm mb-6">
            {t.contact}
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-white/5 rounded-lg">
            <Clock className="w-4 h-4 text-[#db2777] animate-pulse" />
            <span className="text-slate-400 text-sm">
              {t.redirecting} <span className="text-[#db2777] font-bold text-lg">{countdown}</span> {t.seconds}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("Home")}>
              <Button className="w-full sm:w-auto bg-[#db2777] hover:bg-[#be185d] text-white font-semibold">
                <Home className="w-4 h-4 mr-2" />
                {t.goHome}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => base44.auth.logout('/')}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.logout}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-xs mt-8 relative z-10">
          © {new Date().getFullYear()} Dra. María de los Ángeles Quezada Cisnero
        </p>
      </div>
    </div>
  );
}