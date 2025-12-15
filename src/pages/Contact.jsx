import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Send, Building, Linkedin, BookOpen, GraduationCap, Loader2, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "../components/shared/PageHeader";
import { useLanguage } from "../components/shared/LanguageContext";

export default function Contact() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: settings = [] } = useQuery({
    queryKey: ['contact-settings'],
    queryFn: () => contentClient.entities.SiteSettings.list()
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ['contact-institutions'],
    queryFn: () => contentClient.entities.Institution.filter({ visible: true }, 'order')
  });

  const getSetting = (key) => settings.find(s => s.key === key)?.value;

  const getStatusLabel = (status) => {
    const labels = {
      principal: t('contact.roles.principal'),
      collaborator: t('contact.roles.collaborator'),
      visiting: t('contact.roles.visiting')
    };
    return labels[status] || status;
  };

  const contactInfo = [
    { icon: Mail, label: t('contact.email'), value: "angeles.quezada@tectijuana.edu.mx", href: "mailto:angeles.quezada@tectijuana.edu.mx" },
    { icon: Phone, label: t('contact.phone'), value: "+52 664 607 8400", href: "tel:+526646078400" },
    { icon: MapPin, label: t('contact.mainLocation'), value: "Instituto Tecnológico de Tijuana, B.C., México" },
  ];



  const collaborationAreas = [
    { icon: BookOpen, label: t('contact.collaborationAreas.research') },
    { icon: Mail, label: t('contact.collaborationAreas.conferences') },
    { icon: GraduationCap, label: t('contact.collaborationAreas.consulting') },
    { icon: Send, label: t('contact.collaborationAreas.publications') },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    // Save to database
    await contentClient.entities.ContactMessage.create({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    });

    // Fetch settings fresh to get notification emails
    try {
      const allSettings = await contentClient.entities.SiteSettings.list();
      const notificationEmail = allSettings.find(s => s.key === 'contact_notification_email')?.value;
      const ccEmail = allSettings.find(s => s.key === 'contact_cc_email')?.value;
      
      const emailBody = `
<h2>Nuevo mensaje de contacto</h2>
<p><strong>Nombre:</strong> ${formData.name}</p>
<p><strong>Email:</strong> ${formData.email}</p>
<p><strong>Asunto:</strong> ${formData.subject}</p>
<p><strong>Mensaje:</strong></p>
<p>${formData.message}</p>
      `;
      
      // Send to main notification email
      if (notificationEmail && notificationEmail.trim()) {
        await contentClient.integrations.Core.SendEmail({
          to: notificationEmail,
          subject: `Nuevo mensaje de contacto: ${formData.subject}`,
          body: emailBody
        });
      }
      
      // Send CC copy to secondary email
      if (ccEmail && ccEmail.trim()) {
        await contentClient.integrations.Core.SendEmail({
          to: ccEmail,
          subject: `[CC] Nuevo mensaje de contacto: ${formData.subject}`,
          body: emailBody
        });
      }
    } catch (err) {
      console.log('Email notification error:', err);
    }

    setSending(false);
    setSent(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        icon={Mail}
        title={t('contact.title')}
        description={t('contact.description')}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-white p-8">
            <h2 className="text-2xl font-serif font-bold text-[#4a4a4a] mb-2">{t('contact.sendMessage')}</h2>
            <p className="text-slate-600 mb-6">{t('contact.formSubtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-[#4a4a4a] mb-2 block">
                  {language === 'es' ? 'Nombre Completo' : 'Full Name'}
                </label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="border-slate-200 focus:border-[#db2777] focus:ring-[#db2777]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#4a4a4a] mb-2 block">
                  {language === 'es' ? 'Correo Electrónico' : 'Email'}
                </label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border-slate-200 focus:border-[#db2777] focus:ring-[#db2777]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#4a4a4a] mb-2 block">
                  {language === 'es' ? 'Asunto' : 'Subject'}
                </label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                  <SelectTrigger className="border-slate-200 focus:border-[#db2777] focus:ring-[#db2777]">
                    <SelectValue placeholder={language === 'es' ? 'Selecciona un asunto' : 'Select a subject'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Colaboración Académica">{language === 'es' ? 'Colaboración Académica' : 'Academic Collaboration'}</SelectItem>
                    <SelectItem value="Asesoría de Tesis">{language === 'es' ? 'Asesoría de Tesis' : 'Thesis Advising'}</SelectItem>
                    <SelectItem value="Consulta sobre Clases">{language === 'es' ? 'Consulta sobre Clases' : 'Class Inquiry'}</SelectItem>
                    <SelectItem value="Otro">{language === 'es' ? 'Otro' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#4a4a4a] mb-2 block">
                  {language === 'es' ? 'Mensaje' : 'Message'}
                </label>
                <Textarea 
                  className="h-32 border-slate-200 focus:border-[#db2777] focus:ring-[#db2777] resize-y"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
              </div>
              {sent ? (
                <div className="flex items-center justify-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>{language === 'es' ? '¡Mensaje enviado correctamente!' : 'Message sent successfully!'}</span>
                </div>
              ) : (
                <Button type="submit" className="w-full bg-[#db2777] hover:bg-[#db2777]/90 text-white" disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {t('contact.sendMessage')}
                </Button>
              )}
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="bg-white p-6">
              <h3 className="font-bold text-[#4a4a4a] mb-6">{t('contact.contactInfo')}</h3>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="p-3 bg-[#db2777]/10 rounded-lg">
                      <item.icon className="w-5 h-5 text-[#db2777]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="font-medium text-[#4a4a4a] hover:text-[#db2777] transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium text-[#4a4a4a]">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Institutions */}
            <Card className="bg-[#4a4a4a] p-6 text-white">
              <div className="flex items-center gap-2 mb-6">
                <Building className="w-5 h-5 text-[#db2777]" />
                <h3 className="font-bold">{t('contact.institutions')}</h3>
              </div>
              <div className="space-y-4">
                {institutions.length > 0 ? institutions.map((inst) => (
                  <div key={inst.id} className="border-l-2 border-[#db2777] pl-4">
                    <Badge className="bg-[#db2777]/20 text-[#db2777] border-[#db2777]/30 mb-2">
                      {getStatusLabel(inst.status)}
                    </Badge>
                    <h4 className="font-bold mb-1">{inst.name}</h4>
                    <p className="text-sm text-slate-300">{language === 'en' && inst.role_en ? inst.role_en : inst.role}</p>
                    <p className="text-sm text-slate-400">{inst.location}</p>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm">No hay instituciones configuradas</p>
                )}
              </div>
            </Card>

            {/* Social Links */}
            <Card className="bg-white p-6">
              <h3 className="font-bold text-[#4a4a4a] mb-4">{t('contact.links')}</h3>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button variant="outline" className="flex-1">
                  <span className="font-bold mr-2">GS</span>
                  Google Scholar
                </Button>
                <Button variant="outline" className="flex-1">
                  <span className="font-bold mr-2">RG</span>
                  ResearchGate
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Collaboration CTA */}
        <Card className="bg-slate-50 p-8 mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-bold text-[#4a4a4a] mb-2">
              {t('contact.lookingForCollaboration')}
            </h3>
            <p className="text-slate-600">
              {t('contact.collaborationText')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collaborationAreas.map((area, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <area.icon className="w-8 h-8 mx-auto mb-2 text-[#db2777]" />
                <p className="text-sm font-medium text-[#4a4a4a]">{area.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}