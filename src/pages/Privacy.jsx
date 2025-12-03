import React from "react";
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageHeader from "../components/shared/PageHeader";
import { useLanguage } from "../components/shared/LanguageContext";

export default function Privacy() {
  const { language } = useLanguage();

  const sections = language === 'es' ? [
    {
      title: "Información que Recopilamos",
      content: "Recopilamos información que usted nos proporciona directamente, como su nombre, correo electrónico y mensaje cuando utiliza nuestro formulario de contacto. También recopilamos automáticamente cierta información cuando visita nuestro sitio, incluyendo su dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia."
    },
    {
      title: "Uso de la Información",
      content: "Utilizamos la información recopilada para: responder a sus consultas y solicitudes, mejorar nuestro sitio web y su experiencia de usuario, enviar comunicaciones relacionadas con sus intereses académicos (si ha dado su consentimiento), y analizar el uso del sitio para mejorarlo continuamente."
    },
    {
      title: "Cookies y Tecnologías Similares",
      content: "Utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación, recordar sus preferencias, y recopilar información analítica. Puede gestionar sus preferencias de cookies en cualquier momento a través del banner de cookies o la configuración de su navegador."
    },
    {
      title: "Compartir Información",
      content: "No vendemos, comercializamos ni transferimos su información personal a terceros sin su consentimiento, excepto cuando sea necesario para proporcionar nuestros servicios o cuando estemos legalmente obligados a hacerlo."
    },
    {
      title: "Seguridad de Datos",
      content: "Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción."
    },
    {
      title: "Sus Derechos",
      content: "Usted tiene derecho a acceder, rectificar, eliminar o limitar el tratamiento de sus datos personales. También puede oponerse al procesamiento y solicitar la portabilidad de sus datos. Para ejercer estos derechos, contáctenos a través de nuestro formulario de contacto."
    },
    {
      title: "Cambios en esta Política",
      content: "Podemos actualizar esta política de privacidad periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en esta página con una fecha de actualización."
    },
    {
      title: "Contacto",
      content: "Si tiene preguntas sobre esta política de privacidad, puede contactarnos en: angeles.quezada@tectijuana.edu.mx"
    }
  ] : [
    {
      title: "Information We Collect",
      content: "We collect information that you provide directly to us, such as your name, email, and message when you use our contact form. We also automatically collect certain information when you visit our site, including your IP address, browser type, pages visited, and time spent."
    },
    {
      title: "Use of Information",
      content: "We use the collected information to: respond to your inquiries and requests, improve our website and your user experience, send communications related to your academic interests (if you have given consent), and analyze site usage to continuously improve it."
    },
    {
      title: "Cookies and Similar Technologies",
      content: "We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and collect analytical information. You can manage your cookie preferences at any time through the cookie banner or your browser settings."
    },
    {
      title: "Information Sharing",
      content: "We do not sell, trade, or transfer your personal information to third parties without your consent, except when necessary to provide our services or when legally required to do so."
    },
    {
      title: "Data Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
    },
    {
      title: "Your Rights",
      content: "You have the right to access, rectify, delete, or limit the processing of your personal data. You can also object to processing and request data portability. To exercise these rights, contact us through our contact form."
    },
    {
      title: "Changes to this Policy",
      content: "We may update this privacy policy periodically. We will notify you of significant changes by posting the new policy on this page with an update date."
    },
    {
      title: "Contact",
      content: "If you have questions about this privacy policy, you can contact us at: angeles.quezada@tectijuana.edu.mx"
    }
  ];

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={Shield}
        title={language === 'es' ? "Política de Privacidad" : "Privacy Policy"}
        description={language === 'es' ? "Última actualización: Enero 2024" : "Last updated: January 2024"}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-white p-8">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index}>
                <h2 className="text-xl font-bold text-[#4a4a4a] mb-3">{section.title}</h2>
                <p className="text-slate-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}