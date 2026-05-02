"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Eye, MessageCircle, Bookmark, Share2, ArrowLeft, Send } from "lucide-react";

type Story = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image_url: string | null;
  difficulty: string | null;
  season: string | null;
  duration_days: number | null;
  cost_usd: number | null;
  upvotes: number;
  views: number;
  is_featured: boolean;
  published_at: string;
  tags: string[];
  author: { display_name: string; id: string } | null;
};

type Comment = {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  upvotes: number;
};

export default function StoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/stories/${slug}`);
        const data = await res.json();
        if (res.ok) {
          setStory(data.story);
          setLikes(data.story.upvotes);
          setComments(data.comments ?? []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    void load();
  }, [slug]);

  const handleLike = async () => {
    if (!story) return;
    setLiked((l) => !l);
    setLikes((n) => n + (liked ? -1 : 1));
    await fetch(`/api/stories/${story.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: "upvote" }),
    });
  };

  const handleComment = async () => {
    if (!story || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/stories/${story.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [{ ...data.comment, author_name: "You" }, ...prev]);
        setComment("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen pt-28 px-4 max-w-3xl mx-auto">
      <div className="h-64 rounded-3xl skeleton mb-6" />
      <div className="h-8 rounded-xl skeleton mb-3 w-3/4" />
      <div className="h-4 rounded-xl skeleton mb-2" />
      <div className="h-4 rounded-xl skeleton mb-2 w-5/6" />
    </div>
  );

  if (!story) return (
    <div className="min-h-screen pt-28 px-4 max-w-3xl mx-auto text-center">
      <div className="text-6xl mb-4">📝</div>
      <p className="text-gray-500 text-lg">Story not found.</p>
      <Link href="/stories" className="mt-4 inline-block text-blue-600 font-semibold hover:underline">← Back to Stories</Link>
    </div>
  );

  return (
    <main className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg,#f0f4ff 0%,#fafbff 100%)" }}>
      <div className="pt-28 px-4 max-w-3xl mx-auto">
        {/* Back */}
        <Link href="/stories" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Stories
        </Link>

        {/* Cover */}
        {story.cover_image_url && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative h-72 rounded-3xl overflow-hidden mb-8 shadow-xl">
            <Image src={story.cover_image_url} alt={story.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-400">
            {story.author && <span className="font-semibold text-gray-700">{story.author.display_name}</span>}
            <span>·</span>
            <span>{new Date(story.published_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
            {story.duration_days && <><span>·</span><span>🗓 {story.duration_days} days</span></>}
            {story.cost_usd && <><span>·</span><span>💰 ${story.cost_usd}</span></>}
            {story.difficulty && <span className="capitalize bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold px-2 py-0.5 rounded-full">{story.difficulty}</span>}
            {story.season && <span className="capitalize bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded-full">{story.season}</span>}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
            {story.title}
          </h1>

          {/* Tags */}
          {story.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {story.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-8">
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => void handleLike()} className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} /> {likes}
            </motion.button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Eye className="w-4 h-4" /> {story.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <MessageCircle className="w-4 h-4" /> {comments.length}
            </span>
            <div className="ml-auto flex gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBookmarked((b) => !b)} className={`p-2 rounded-xl border transition-colors ${bookmarked ? "bg-blue-50 border-blue-200 text-blue-600" : "border-gray-200 text-gray-400 hover:border-blue-300"}`}>
                <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:border-gray-400 transition-colors">
                <Share2 className="w-4 h-4" />
              </motion.button>
              {copied && <span className="text-xs text-emerald-600 self-center">Copied!</span>}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 whitespace-pre-wrap"
        >
          {story.content}
        </motion.div>

        {/* Comments */}
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" /> Comments ({comments.length})
          </h2>

          {/* Add comment */}
          <div className="flex gap-3 mb-8">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">Y</div>
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Share your thoughts…"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 resize-none"
              />
              <div className="flex justify-end mt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => void handleComment()}
                  disabled={submitting || !comment.trim()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {submitting ? "Posting…" : "Post"}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Comment list */}
          <div className="space-y-4">
            {comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                  {c.author_name?.[0]?.toUpperCase() ?? "T"}
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{c.author_name}</span>
                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{c.content}</p>
                </div>
              </motion.div>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
