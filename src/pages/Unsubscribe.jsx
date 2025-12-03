import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MailX, CheckCircle, Loader2, AlertCircle, Heart, BookOpen, Mic, Calendar, ArrowLeft, Sparkles } from "lucide-react";

export default function Unsubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error', 'not_found', 'stayed'
  const [showReasons, setShowReasons] = useState(false);
  
  const handleUnsubscribe = async () => {
    if (!email || !email.includes('@')) return;
    setShowReasons(true);
  };

  const confirmUnsubscribe = async () => {
    setStatus('loading');
    
    try {
      const subscribers = await base44.entities.Subscriber.filter({ email: email });
      
      if (subscribers.length === 0) {
        setStatus('not_found');
        return;
      }
      
      await base44.entities.Subscriber.update(subscribers[0].id, { active: false });
      setStatus('success');
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setStatus('error');
    }
  };

  const staySubscribed = () => {
    setStatus('stayed');
  };

  const benefits = [
    { icon: BookOpen, text: "Publicaciones académicas exclusivas", color: "text-blue-500" },
    { icon: Mic, text: "Nuevos episodios del podcast", color: "text-purple-500" },
    { icon: Calendar, text: "Invitaciones a eventos y conferencias", color: "text-green-500" },
    { icon: Sparkles, text: "Insights sobre innovación y desarrollo", color: "text-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#D4AF37]/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="max-w-lg w-full p-8 text-center relative bg-white/80 backdrop-blur-sm shadow-2xl shadow-slate-200/50 border-0 animate-fade-in">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent rounded-bl-[100px]"></div>
        
        {status === 'stayed' ? (
          <div className="py-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#0A2540] mb-3">
              ¡Gracias por quedarte! 🎉
            </h1>
            <p className="text-slate-600 mb-6">
              Nos alegra que sigas con nosotros. Continuaremos enviándote contenido de valor.
            </p>
            <div className="p-4 bg-gradient-to-r from-[#D4AF37]/10 to-amber-100/50 rounded-xl mb-6">
              <p className="text-[#0A2540] font-medium">
                "La innovación distingue a un líder de un seguidor."
              </p>
              <p className="text-sm text-slate-500 mt-1">— Steve Jobs</p>
            </div>
            <Link to={createPageUrl("Home")}>
              <Button className="bg-gradient-to-r from-[#0A2540] to-[#1e3a5f] hover:opacity-90 shadow-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        ) : status === 'success' ? (
          <div className="py-6 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-[#0A2540] mb-2">Suscripción cancelada</h2>
            <p className="text-slate-600 mb-6">Ya no recibirás más correos. Te extrañaremos.</p>
            <Link to={createPageUrl("Home")}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        ) : status === 'not_found' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-800">No encontramos ese correo en nuestra lista.</p>
            </div>
            <Button variant="outline" onClick={() => { setStatus(null); setShowReasons(false); }}>
              Intentar con otro correo
            </Button>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-800">Ocurrió un error. Intenta de nuevo.</p>
            </div>
            <Button variant="outline" onClick={() => setStatus(null)}>
              Reintentar
            </Button>
          </div>
        ) : showReasons ? (
          <div className="animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
              <Heart className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0A2540] mb-2">
              ¡Espera un momento!
            </h1>
            <p className="text-slate-600 mb-6">
              Antes de irte, recuerda lo que te perderás:
            </p>
            
            <div className="space-y-3 mb-6">
              {benefits.map((benefit, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:scale-[1.02] cursor-default"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center ${benefit.color}`}>
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-[#0A2540]/5 to-[#D4AF37]/10 rounded-xl mb-6">
              <p className="text-sm text-[#0A2540]">
                💡 <strong>Tip:</strong> Enviamos máximo 2 correos al mes con contenido de alto valor.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={staySubscribed}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:opacity-90 text-white shadow-lg shadow-[#D4AF37]/30 h-12 text-base"
              >
                <Heart className="w-5 h-5 mr-2" />
                ¡Quiero seguir suscrito!
              </Button>
              <Button 
                variant="ghost"
                onClick={confirmUnsubscribe}
                disabled={status === 'loading'}
                className="w-full text-slate-500 hover:text-slate-700 h-10"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
                ) : (
                  'No, cancelar de todas formas'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <MailX className="w-8 h-8 text-slate-500" />
            </div>
            
            <h1 className="text-2xl font-serif font-bold text-[#0A2540] mb-2">
              ¿Deseas cancelar tu suscripción?
            </h1>
            <p className="text-slate-600 mb-6">
              Ingresa tu correo electrónico para continuar.
            </p>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-center"
              />
              <Button
                onClick={handleUnsubscribe}
                disabled={!email}
                className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 h-11"
              >
                Continuar
              </Button>
              <Link to={createPageUrl("Home")} className="block">
                <Button variant="ghost" className="w-full text-slate-500">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
          Dra. María de los Ángeles Quezada · Instituto Tecnológico de Tijuana, B.C., México
        </p>
      </Card>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}