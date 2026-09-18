"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardContent, Button, Badge } from "@/components/ui";
import { Clock, ArrowLeft, ArrowRight, Share2, CheckCircle2, User, BookOpen, ShieldCheck, Bookmark } from "lucide-react";
import { BLOG_POSTS, getBlogPostBySlug } from "../data";

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
          <h1 className="text-3xl font-display font-black text-white uppercase">Article Not Found</h1>
          <p className="text-xs text-[#A3A3A3]">The requested blog article does not exist or has been moved.</p>
          <Link href="/blog">
            <Button variant="athletic" size="md" className="bg-[#F21717] hover:bg-[#D90F0F]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Articles
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/blog">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-2 border-white/10 text-[#A3A3A3] hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Articles
            </Button>
          </Link>
          <span className="text-xs text-[#737373]">Official REP 1 Article</span>
        </div>

        {/* Article Header Card */}
        <Card className="bg-[#111111] border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <Badge variant="athletic" className="bg-[#F21717]/20 border border-[#F21717]/40 text-[#F21717] px-3 py-1 text-xs uppercase tracking-wider">
              {post.category}
            </Badge>

            <div className="flex items-center gap-4 text-xs text-[#A3A3A3]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F21717]" /> {post.readTime}
              </span>
              <span>•</span>
              <span>{post.date}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-display uppercase text-2xl sm:text-4xl font-black text-white leading-tight">
              {post.title}
            </h1>
            <p className="text-sm sm:text-base text-[#D4D4D4] leading-relaxed font-medium bg-[#181818] p-4 rounded-xl border border-white/5">
              {post.summary}
            </p>
          </div>

          {/* Author Block */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F21717]/10 border border-[#F21717]/30 flex items-center justify-center text-[#F21717]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wide">{post.author}</p>
                <p className="text-[11px] text-[#737373]">{post.authorTitle}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Article link copied to clipboard!");
                }
              }}
              className="text-xs font-bold border-white/10 text-[#A3A3A3] hover:text-white gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
        </Card>

        {/* Article Body Content */}
        <Card className="bg-[#111111] border-white/10 p-6 sm:p-10 space-y-8 text-[#D4D4D4] text-sm sm:text-base leading-relaxed">
          {/* Introduction */}
          <p className="text-base sm:text-lg font-medium text-white/90 leading-relaxed border-l-2 border-[#F21717] pl-4 italic">
            "{post.content.introduction}"
          </p>

          {/* Sections */}
          {post.content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-4 pt-4 border-t border-white/5">
              <h2 className="font-display uppercase text-xl sm:text-2xl font-bold text-white tracking-wide">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  {p}
                </p>
              ))}

              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <ul className="space-y-2 bg-[#181818] p-4 sm:p-5 rounded-xl border border-white/5 text-xs sm:text-sm text-[#D4D4D4]">
                  {sec.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#F21717] flex-shrink-0 mt-0.5" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Key Takeaways Card */}
          <div className="bg-[#181818] border border-[#F21717]/30 rounded-2xl p-6 space-y-3 shadow-[0_0_30px_rgba(242,23,23,0.08)]">
            <h3 className="font-display uppercase text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#F21717]" /> Key Takeaways for Athletes & Families
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A3A3A3]">
              {post.content.keyTakeaways.map((kt, kIdx) => (
                <li key={kIdx} className="flex items-start gap-2">
                  <span className="text-[#F21717] font-bold">•</span>
                  <span>{kt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conclusion */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="font-display uppercase text-lg font-bold text-white">Summary & Next Steps</h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              {post.content.conclusion}
            </p>
          </div>
        </Card>

        {/* Bottom Call to Action */}
        <Card className="bg-[#181818] border border-[#F21717]/40 p-6 sm:p-8 text-center space-y-4">
          <h3 className="font-display uppercase text-xl font-black text-white">
            Take Your Recruiting & Development to the Next Level
          </h3>
          <p className="text-xs text-[#A3A3A3] max-w-xl mx-auto">
            Join the REP 1 Student Academy to access verified combine testing, AI mock interview preparation, and collegiate recruitment pathways.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/signup">
              <Button variant="athletic" size="md" className="bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold uppercase tracking-wider">
                Create Athlete Profile &rarr;
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="md" className="border-white/20 text-xs font-bold uppercase tracking-wider">
                View Access Plans
              </Button>
            </Link>
          </div>
        </Card>

        {/* Related Articles Grid */}
        <div className="space-y-4 pt-6">
          <h3 className="font-display uppercase text-lg font-bold text-white">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <Link key={rel.id} href={`/blog/${rel.slug}`} className="block group">
                <Card hoverEffect className="bg-[#111111] border-white/10 h-full p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-[#F21717] uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <h4 className="font-display uppercase text-sm font-bold text-white group-hover:text-[#F21717] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-[#A3A3A3] line-clamp-2 leading-relaxed">
                      {rel.summary}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-[10px] text-[#737373]">
                    <span>{rel.readTime}</span>
                    <span className="font-bold text-[#F21717] flex items-center gap-1 group-hover:underline">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
