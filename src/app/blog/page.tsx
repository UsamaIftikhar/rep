"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardContent, Input } from "@/components/ui";
import { Search, Clock, ArrowRight } from "lucide-react";
import { BLOG_POSTS, BlogPost } from "./data";

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
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
              <Card
                hoverEffect
                className="bg-[#111111] border-white/10 flex flex-col justify-between h-full overflow-hidden"
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
                    <h3 className="font-display uppercase text-lg font-bold text-white leading-tight mb-2 group-hover:text-[#F21717] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#A3A3A3] line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </CardContent>

                <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                  <span className="text-[11px] text-[#737373]">{post.date}</span>
                  <span className="font-bold text-[#F21717] flex items-center gap-1 group-hover:underline">
                    Read Article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
