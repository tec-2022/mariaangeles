import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Cookie, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "./LanguageContext";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { language } = useLanguage();
  
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: true
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Auto-accept all cookies and show banner for transparency
      const allAccepted = { necessary: true, analytics: true, marketing: true };
      localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
      localStorage.setItem('cookieConsentDate', new Date().toISOString());
      setPreferences(allAccepted);
      window.dispatchEvent(new CustomEvent('analyticsConsent', { detail: true }));
      // Still show banner so user knows and can change preferences
      setShowBanner(true);
    } else {
      const saved = JSON.parse(consent);
      setPreferences(saved);
      if (saved.analytics) {
        window.dispatchEvent(new CustomEvent('analyticsConsent', { detail: true }));
      }
    }
  }, []);

  const saveConsent = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
    
    // Dispatch event for analytics initialization
    if (prefs.analytics) {
      window.dispatchEvent(new CustomEvent('analyticsConsent', { detail: true }));
    }
  };

  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptNecessary = () => {
    const onlyNecessary = { necessary: true, analytics: false, marketing: false };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  const texts = {
    es: {
      title: "🍪 Usamos cookies",
      description: "Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. Puedes aceptar todas las cookies o configurar tus preferencias.",
      acceptAll: "Aceptar todas",
      acceptNecessary: "Solo necesarias",
      settings: "Configurar",
      save: "Guardar preferencias",
      necessary: "Cookies necesarias",
      necessaryDesc: "Esenciales para el funcionamiento del sitio",
      analytics: "Cookies analíticas",
      analyticsDesc: "Nos ayudan a entender cómo usas el sitio",
      marketing: "Cookies de marketing",
      marketingDesc: "Permiten contenido personalizado",
      moreInfo: "Más información en nuestra",
      privacyPolicy: "Política de Privacidad"
    },
    en: {
      title: "🍪 We use cookies",
      description: "We use cookies to improve your experience, analyze site traffic, and personalize content. You can accept all cookies or configure your preferences.",
      acceptAll: "Accept all",
      acceptNecessary: "Only necessary",
      settings: "Settings",
      save: "Save preferences",
      necessary: "Necessary cookies",
      necessaryDesc: "Essential for site functionality",
      analytics: "Analytics cookies",
      analyticsDesc: "Help us understand how you use the site",
      marketing: "Marketing cookies",
      marketingDesc: "Enable personalized content",
      moreInfo: "More information in our",
      privacyPolicy: "Privacy Policy"
    }
  };

  const t = texts[language];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto bg-white shadow-2xl border-t-4 border-[#db2777]">
        {!showSettings ? (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Cookie className="w-8 h-8 text-[#db2777] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-[#4a4a4a] mb-2">{t.title}</h3>
                <p className="text-sm text-slate-600 mb-4">
                  {t.description}{" "}
                  <Link to={createPageUrl("Privacy")} className="text-[#db2777] hover:underline">
                    {t.moreInfo} {t.privacyPolicy}
                  </Link>
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={acceptAll} className="bg-[#db2777] hover:bg-[#be185d] text-white">
                    {t.acceptAll}
                  </Button>
                  <Button onClick={acceptNecessary} variant="outline">
                    {t.acceptNecessary}
                  </Button>
                  <Button onClick={() => setShowSettings(true)} variant="ghost" className="text-slate-600">
                    <Settings className="w-4 h-4 mr-2" />
                    {t.settings}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#4a4a4a]">{t.settings}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-[#4a4a4a]">{t.necessary}</p>
                  <p className="text-xs text-slate-500">{t.necessaryDesc}</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-[#4a4a4a]">{t.analytics}</p>
                  <p className="text-xs text-slate-500">{t.analyticsDesc}</p>
                </div>
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-[#4a4a4a]">{t.marketing}</p>
                  <p className="text-xs text-slate-500">{t.marketingDesc}</p>
                </div>
                <Switch 
                  checked={preferences.marketing} 
                  onCheckedChange={(checked) => setPreferences({...preferences, marketing: checked})}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={savePreferences} className="bg-[#db2777] hover:bg-[#be185d] text-white">
                {t.save}
              </Button>
              <Button onClick={acceptAll} variant="outline">
                {t.acceptAll}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}