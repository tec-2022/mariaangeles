import React, { useState, useEffect } from "react";
import { Heart, Share2, Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "../shared/LanguageContext";
import { trackEngagement, trackShare } from "../shared/Analytics";

export default function LikeShareButtons({ postId, postTitle }) {
  const { language } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already liked from localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    if (likedPosts.includes(postId)) {
      setLiked(true);
    }
  }, [postId]);

  const handleLike = () => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    
    if (liked) {
      // Unlike
      const updated = likedPosts.filter(id => id !== postId);
      localStorage.setItem('likedPosts', JSON.stringify(updated));
      setLiked(false);
      setLikeCount(prev => prev - 1);
      trackEngagement('like', postId, 'remove');
    } else {
      // Like
      likedPosts.push(postId);
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      setLiked(true);
      setLikeCount(prev => prev + 1);
      trackEngagement('like', postId, 'add');
    }
  };

  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(postTitle);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const texts = {
    es: {
      like: "Me gusta",
      share: "Compartir",
      copyLink: "Copiar enlace",
      copied: "¡Copiado!"
    },
    en: {
      like: "Like",
      share: "Share",
      copyLink: "Copy link",
      copied: "Copied!"
    }
  };

  const t = texts[language];

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={liked ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        className={liked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
      >
        <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
        {likeCount}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            {t.share}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a 
              href={shareLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2"
              onClick={() => trackShare(postId, 'twitter')}
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href={shareLinks.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2"
              onClick={() => trackShare(postId, 'facebook')}
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href={shareLinks.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2"
              onClick={() => trackShare(postId, 'linkedin')}
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              copyLink();
              trackShare(postId, 'copy_link');
            }} 
            className="flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
            {copied ? t.copied : t.copyLink}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}