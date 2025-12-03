import React from "react";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageHeader from "../components/shared/PageHeader";
import { useLanguage } from "../components/shared/LanguageContext";

export default function Terms() {
  const { language } = useLanguage();

  const sections = language === 'es' ? [
    {
      title: "Aceptación de Términos",
      content: "Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice este sitio."
    },
    {
      title: "Uso del Sitio",
      content: "Este sitio web es de carácter académico e informativo. El contenido está destinado a compartir investigación, publicaciones y actividades académicas de la Dra. María de los Ángeles Quezada Cisnero. Usted se compromete a utilizar este sitio únicamente para fines legales y de manera que no infrinja los derechos de terceros."
    },
    {
      title: "Propiedad Intelectual",
      content: "Todo el contenido de este sitio, incluyendo textos, imágenes, logotipos, diseños y publicaciones académicas, está protegido por derechos de autor y otras leyes de propiedad intelectual. No puede reproducir, distribuir o modificar ningún contenido sin autorización previa por escrito."
    },
    {
      title: "Contenido Académico",
      content: "Las publicaciones, artículos y materiales académicos compartidos en este sitio representan investigaciones y opiniones del autor. El uso de este contenido debe realizarse citando apropiadamente la fuente conforme a las normas académicas vigentes."
    },
    {
      title: "Enlaces a Terceros",
      content: "Este sitio puede contener enlaces a sitios web de terceros. No somos responsables del contenido, políticas de privacidad o prácticas de estos sitios externos. Le recomendamos revisar los términos de cada sitio que visite."
    },
    {
      title: "Limitación de Responsabilidad",
      content: "El contenido de este sitio se proporciona 'tal cual' sin garantías de ningún tipo. No seremos responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso de este sitio."
    },
    {
      title: "Modificaciones",
      content: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio. El uso continuado del sitio constituye la aceptación de los términos modificados."
    },
    {
      title: "Contacto",
      content: "Para consultas sobre estos términos, contáctenos en: angeles.quezada@tectijuana.edu.mx"
    }
  ] : [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using this website, you agree to be bound by these terms and conditions of use. If you do not agree with any of these terms, please do not use this site."
    },
    {
      title: "Site Usage",
      content: "This website is academic and informational in nature. The content is intended to share research, publications, and academic activities of Dr. María de los Ángeles Quezada Cisnero. You agree to use this site only for lawful purposes and in a manner that does not infringe the rights of third parties."
    },
    {
      title: "Intellectual Property",
      content: "All content on this site, including texts, images, logos, designs, and academic publications, is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or modify any content without prior written authorization."
    },
    {
      title: "Academic Content",
      content: "Publications, articles, and academic materials shared on this site represent the author's research and opinions. Use of this content must be done by properly citing the source in accordance with current academic standards."
    },
    {
      title: "Third-Party Links",
      content: "This site may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of these external sites. We recommend reviewing the terms of each site you visit."
    },
    {
      title: "Limitation of Liability",
      content: "The content of this site is provided 'as is' without warranties of any kind. We will not be liable for direct, indirect, incidental, or consequential damages arising from the use of this site."
    },
    {
      title: "Modifications",
      content: "We reserve the right to modify these terms at any time. Changes will take effect immediately upon posting on the site. Continued use of the site constitutes acceptance of the modified terms."
    },
    {
      title: "Contact",
      content: "For inquiries about these terms, contact us at: angeles.quezada@tectijuana.edu.mx"
    }
  ];

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={FileText}
        title={language === 'es' ? "Términos y Condiciones" : "Terms and Conditions"}
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