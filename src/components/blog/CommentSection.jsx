import React, { useState } from "react";
import { contentClient } from "@/api/contentClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, User, Loader2, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "../shared/LanguageContext";
import { trackEngagement } from "../shared/Analytics";

export default function CommentSection({ postId }) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", comment: "" });
  const [submitted, setSubmitted] = useState(false);

  // Fetch approved comments for this post from database
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => contentClient.entities.Comment.filter({ post_id: postId, approved: true }, '-created_date'),
    enabled: !!postId
  });

  // Create comment mutation
  const createMutation = useMutation({
    mutationFn: (data) => contentClient.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      setForm({ name: "", email: "", comment: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) return;
    
    await createMutation.mutateAsync({
      post_id: postId,
      name: form.name,
      email: form.email,
      content: form.comment,
      approved: false // Requires admin approval
    });
    
    trackEngagement('comment', postId, 'add');

    // Send notification email
    try {
      const settings = await contentClient.entities.SiteSettings.filter({ key: 'contact_notification_email' });
      const notificationEmail = settings[0]?.value;
      if (notificationEmail && notificationEmail.trim()) {
        await contentClient.integrations.Core.SendEmail({
          to: notificationEmail,
          subject: `Nuevo comentario en el blog`,
          body: `
<h2>Nuevo comentario pendiente de aprobación</h2>
<p><strong>Autor:</strong> ${form.name}</p>
<p><strong>Email:</strong> ${form.email}</p>
<p><strong>Comentario:</strong></p>
<p>${form.comment}</p>
          `
        });
      }
    } catch (err) {
      console.log('Email notification error:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const texts = {
    es: {
      title: "Comentarios",
      leaveComment: "Deja un comentario",
      name: "Tu nombre",
      email: "Tu correo electrónico",
      comment: "Tu comentario",
      submit: "Enviar comentario",
      submitting: "Enviando...",
      noComments: "Sé el primero en comentar",
      pendingApproval: "Tu comentario ha sido enviado y está pendiente de aprobación."
    },
    en: {
      title: "Comments",
      leaveComment: "Leave a comment",
      name: "Your name",
      email: "Your email",
      comment: "Your comment",
      submit: "Submit comment",
      submitting: "Submitting...",
      noComments: "Be the first to comment",
      pendingApproval: "Your comment has been submitted and is pending approval."
    }
  };

  const t = texts[language];

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-serif font-bold text-[#0A2540] mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-[#D4AF37]" />
        {t.title} ({comments.length})
      </h3>

      {/* Comment Form */}
      <Card className="p-6 mb-8">
        <h4 className="font-semibold text-[#0A2540] mb-4">{t.leaveComment}</h4>
        
        {submitted ? (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>{t.pendingApproval}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder={t.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder={t.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <Textarea
              placeholder={t.comment}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              rows={4}
              required
            />
            <Button 
              type="submit" 
              className="bg-[#D4AF37] hover:bg-[#c4a030] text-white"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {createMutation.isPending ? t.submitting : t.submit}
            </Button>
          </form>
        )}
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">{t.noComments}</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#0A2540]">{comment.name}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{formatDate(comment.created_date)}</span>
                  </div>
                  <p className="text-slate-600">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}