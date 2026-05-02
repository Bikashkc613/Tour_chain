"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, BookOpen, TrendingUp, Star, Plus, Heart, Eye } from "lucide-react";

type Story = {
  id: string;
  title: string;
  slug: string;
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
  author: { display_name: string; avatar?: string } | null;
  tags: string[];
};

const DIFF_COLOR: Record<string, string> = {
  easy:        "text-emerald-600 bg-emerald-50 border-emerald-200",
  moderate:    "text-amber-600 bg-amber-50 border-amber-200",
  challenging: "text-orange-600 bg-orange-50 border-orange-200",
  extreme:     "text-red-600 bg-red-50 border-red-200",
};

function StoryCard({ story, index }: { story: Story; index: number }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(story.upvotes);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked((l) => !l);
    setLikes((n) => n + (liked ? -1 : 1));
    await fetch(`/api/stories/${story.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: "upvote" }),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/stories/${story.slug}`} className="block bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/8 transition-all duration-300 overflow-hidden group">
        {/* Cover image */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {story.cover_image_url ? (
            <Image
              src={story.cover_image_url}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-blue-50 to-indigo-100">🏔️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {story.is_featured && (
            <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Featured
            </div>
          )}
          {story.difficulty && (
            <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full border ${DIFF_COLOR[story.difficulty] ?? DIFF_COLOR.moderate}`}>
              {story.difficulty}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
            {story.author && <span className="font-semibold text-gray-600">{story.author.display_name}</span>}
            {story.author && <span>·</span>}
            <span>{new Date(story.published_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
            {story.duration_days && <><span>·</span><span>{story.duration_days} days</span></>}
            {story.cost_usd && <><span>·</span><span>${story.cost_usd}</span></>}
          </div>

          <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {story.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">{story.excerpt}</p>

          {/* Tags */}
          {story.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {story.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{story.views.toLocaleString()}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              {likes}
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ sort });
        if (search) params.set("q", search);
        const res = await fetch(`/api/stories?${params}`);
        const data = await res.json();
        setStories(data.stories ?? []);
      } catch { setStories([]); }
      setLoading(false);
    };
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [sort, search]);

  const featured = stories.filter((s) => s.is_featured);
  const rest = stories.filter((s) => !s.is_featured);

  return (
    <main className="min-h-screen pb-20 relative" style={{ background: "linear-gradient(160deg,#f0f4ff 0%,#fafbff 50%,#f0fff4 100%)" }}>
      <div className="fixed top-[-40px] right-[-40px] w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,rgba(26,43,74,0.07),transparent 70%)", animation: "orb-float 22s ease-in-out infinite" }} />

      <div className="relative z-10 pt-28 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-600 font-medium mb-3">
              <BookOpen className="w-4 h-4" /> Trek Stories & Blog
            </div>
            <h1 className="text-5xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
              📝 <span style={{ background: "linear-gradient(135deg,#1a2b4a,#2d6a4f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Stories</span>
            </h1>
            <p className="text-gray-500 mt-2">Real experiences from real trekkers. Verified on-chain.</p>
          </div>
          <Link
            href="/stories/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/25 shrink-0"
          >
            <Plus className="w-4 h-4" /> Write a Story
          </Link>
        </motion.div>

        {/* Search + sort */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400/40 text-gray-800"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: "recent",   icon: <BookOpen className="w-3.5 h-3.5" />,   label: "Recent" },
              { key: "popular",  icon: <Heart className="w-3.5 h-3.5" />,      label: "Popular" },
              { key: "trending", icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Trending" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  sort === s.key ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-80 rounded-3xl skeleton" />)}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Featured Stories
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.map((s, i) => <StoryCard key={s.id} story={s} index={i} />)}
                </div>
              </div>
            )}

            {/* All stories */}
            <div>
              {featured.length > 0 && <h2 className="text-lg font-bold text-gray-700 mb-4">All Stories</h2>}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((s, i) => <StoryCard key={s.id} story={s} index={i} />)}
              </div>
            </div>

            {stories.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg font-semibold">No stories yet</p>
                <Link href="/stories/new" className="mt-4 inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-colors">
                  Write the First Story →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
