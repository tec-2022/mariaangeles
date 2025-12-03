import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import AdminTable from "./AdminTable";

export default function AdminComments() {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => base44.entities.Comment.list('-created_date')
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['admin-blog-posts-for-comments'],
    queryFn: () => base44.entities.BlogPost.list()
  });

  const getPostTitle = (postId) => {
    const post = blogPosts.find(p => p.id === postId);
    return post?.title || postId;
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Comment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Comment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    }
  });

  const handleApprove = (comment) => {
    updateMutation.mutate({ id: comment.id, data: { approved: true } });
  };

  const handleReject = (comment) => {
    updateMutation.mutate({ id: comment.id, data: { approved: false } });
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este comentario?")) {
      deleteMutation.mutate(id);
    }
  };

  const pendingComments = comments.filter(c => !c.approved);
  const approvedComments = comments.filter(c => c.approved);

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div></div>;
  }

  const CommentCard = ({ comment, showApprove = false }) => (
    <Card className="p-4 bg-white">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center font-bold flex-shrink-0">
          {comment.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{comment.name}</h4>
            <span className="text-sm text-slate-500">{comment.email}</span>
          </div>
          <p className="text-sm text-slate-600 mb-2">{comment.content}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={createPageUrl(`BlogPost?id=${comment.post_id}`)} className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              {getPostTitle(comment.post_id)}
            </Link>
            <span className="text-xs text-slate-400">
              {new Date(comment.created_date).toLocaleDateString('es')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showApprove && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleApprove(comment)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleReject(comment)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
          {!showApprove && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleReject(comment)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDelete(comment.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pendientes
            {pendingComments.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingComments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Aprobados ({approvedComments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {pendingComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} showApprove />
            ))}
            {pendingComments.length === 0 && (
              <Card className="p-12 text-center bg-white">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay comentarios pendientes</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="space-y-4">
            {approvedComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
            {approvedComments.length === 0 && (
              <Card className="p-12 text-center bg-white">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay comentarios aprobados</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}