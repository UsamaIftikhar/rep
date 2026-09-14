"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardContent, Button, Input } from "@/components/ui";
import { BookOpen, Search, Clock, ArrowRight, Sparkles, Trophy, Users, ShieldCheck, Newspaper } from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  summary: string;
  featured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "nil-playbook-2026",
    title: "The 2026 NIL Playbook: Navigating Student-Athlete Monetization",
    category: "NIL & Marketing",
    readTime: "5 min read",
    date: "September 12, 2026",
    author: "REP 1 Compliance Team",
    summary: "Essential guidelines for high school and collegiate athletes navigating 1099 contracts, sponsor deliverables, tax reserves, and brand compliance without compromising eligibility.",
    featured: true,
  },
  {
    id: "2",
    slug: "australia-to-america-roadmap",
    title: "Australia to America: Crossing the Pacific for US College Football",
    category: "International Recruiting",
    readTime: "7 min read",
    date: "September 8, 2026",
    author: "Elite Pacific Sports Scouting",
    summary: "A comprehensive breakdown of NCAA eligibility certification, SEVIS visa processing, SAT/ACT requirements, and adapting to American collegiate sports culture for international prospects.",
    featured: true,
  },
  {
    id: "3",
    slug: "mastering-recruiter-interviews",
    title: "Mastering High-Stakes Recruiter Interviews with AI Coaching",
    category: "Recruiter Prep",
    readTime: "4 min read",
    date: "September 4, 2026",
    author: "REP 1 Media & Communications",
    summary: "How elite prospects use practice scenario drills to refine vocal poise, body language, and executive confidence during official college visits and recruiter calls.",
    featured: true,
  },
  {
    id: "4",
    slug: "combine-metrics-that-matter",
    title: "Combine Metrics That College Coaches Actually Look For",
    category: "Athletic Performance",
    readTime: "6 min read",
    date: "August 28, 2026",
    author: "REP 1 Performance Staff",
    summary: "Why 10-yard splits, shuttle agility, and broad jump explosiveness carry more weight with Power 4 and FCS evaluators than raw max lifts.",
  },
  {
    id: "5",
    slug: "division-1-vs-division-2-eligibility",
    title: "NCAA Division 1, 2, 3 & NAIA Eligibility Rules Explained",
    category: "Academic Eligibility",
    readTime: "8 min read",
    date: "August 20, 2026",
    author: "REP 1 Academic Advisory",
    summary: "Understanding core course GPA calculations, amateurism certification, transfer portal rules, and scholarship caps across collegiate divisions.",
  },
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");

  const categories = ["ALL", ...Array.from(new Set(BLOG_POSTS.map((p) => p.category)))];

  const filteredPosts = BLOG_POSTS.filter((p) => {
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="REP 1 Media & Insights"
        title="Official REP 1 Blog"
        description="Recruiting guides, NIL legal playbooks, international pathways, and athlete performance articles from our expert staff."
      />

      <div className="space-y-8 pb-16">
        {/* Search & Categories Bar */}
        <Card className="bg-[#111111] border-white/10 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, topic, or keyword..."
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                      : "bg-[#181818] text-[#A3A3A3] hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              hoverEffect
              className="bg-[#111111] border-white/10 flex flex-col justify-between overflow-hidden"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F21717]/15 border border-[#F21717]/30 text-[9px] font-bold text-[#F21717] uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-[#737373] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>

                <div>
                  <h3 className="font-display uppercase text-lg font-bold text-white leading-tight mb-2 hover:text-[#F21717] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#A3A3A3] line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </CardContent>

              <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                <span className="text-[11px] text-[#737373]">{post.date}</span>
                <span className="font-bold text-[#F21717] flex items-center gap-1 hover:underline">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
