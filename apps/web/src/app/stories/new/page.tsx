"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Eye, Send, Image as ImageIcon, Tag, X } from "lucide-react";

const SEASONS = ["spring","summer","monsoon","autumn","winter"];
const DIFFICULTIES = ["easy","moderate","challenging","extreme"];

export default function NewStoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    cover_image_url: "",
    difficulty: "",
    season: "",
    duration_days: "",
    cost_usd: "",
    is_published: false,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const submit = async (publish: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration_days: form.duration_days ? Number(form.duration_days) : undefined,
          cost_usd: form.cost_usd ? Number(form.cost_usd) : undefined,
          is_published: publish,
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error?.message ?? "Failed to save"); return; }
      router.push(`/stories/${data.story.slug}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg,#f0f4ff 0%,#fafbff 100%)" }}>
      <div className="pt-28 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>✍️ Write a Story</h1>
            <p className="text-gray-500 mt-1">Share your Himalayan adventure with the community</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPreview((p) => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-300 text-sm font-semibold transition-colors">
              <Eye className="w-4 h-4" /> {preview ? "Edit" : "Preview"}
            </button>
          </div>
        </motion.div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}

        <div className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="My Epic Everest Base Camp Journey…"
              className="w-full text-2xl font-bold text-gray-900 border-none outline-none placeholder-gray-300 bg-transparent"
            />
          </div>

          {/* Cover image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Cover Image URL
            </label>
            <input
              value={form.cover_image_url}
              onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
              placeholder="https://images.unsplash.com/…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
            {form.cover_image_url && (
              <div className="mt-3 h-40 rounded-xl overflow-hidden bg-gray-100">
                <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Trek Details</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 capitalize">
                  <option value="">Select…</option>
                  {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Season</label>
                <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 capitalize">
                  <option value="">Select…</option>
                  {SEASONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Duration (days)</label>
                <input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} placeholder="14" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Cost (USD)</label>
                <input type="number" value={form.cost_usd} onChange={(e) => setForm({ ...form, cost_usd: e.target.value })} placeholder="1200" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                  #{tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag (press Enter)"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
              <button onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">Add</button>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Excerpt (shown in cards)</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              maxLength={300}
              placeholder="A short summary of your story…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.excerpt.length}/300</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Story Content * (Markdown supported)</label>
            {preview ? (
              <div className="prose prose-sm max-w-none min-h-[300px] text-gray-700 whitespace-pre-wrap">{form.content || <span className="text-gray-300">Nothing to preview yet…</span>}</div>
            ) : (
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={16}
                placeholder={`# My Trek Story\n\nStart writing your adventure here...\n\n## Day 1 — Arrival in Kathmandu\n\nThe moment I landed at Tribhuvan International Airport...`}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 resize-none font-mono"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => void submit(false)}
              disabled={saving || !form.title || !form.content}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Draft
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => void submit(true)}
              disabled={saving || !form.title || !form.content}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {saving ? "Publishing…" : "Publish Story"}
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  );
}
