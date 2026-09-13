"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Film, Maximize2, X } from "lucide-react";

interface MediaSlide {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  objectPosition?: string;
}

const slides: MediaSlide[] = [
  {
    id: 1,
    title: "Elite Pacific Sports Prospects",
    category: "Global Recruiting Combine",
    imageUrl: "/images/athletes_team.jpeg",
    objectPosition: "object-center",
  },
  {
    id: 2,
    title: "Combine Metric & Broad Jump Testing",
    category: "Verified Performance Data",
    imageUrl: "/images/combine_jump.jpeg",
    objectPosition: "object-center",
  },
  {
    id: 3,
    title: "Rep 1 Coaching Staff — Exposure Has No Borders",
    category: "Mentorship & Leadership",
    imageUrl: "/images/IMG_7403.jpeg",
    objectPosition: "object-top",
  },
  {
    id: 4,
    title: "Marvin Constant with Gridiron Prospects",
    category: "Player Development & Scouting",
    imageUrl: "/images/marvin_athletes.jpeg",
    objectPosition: "object-top",
  },
  {
    id: 5,
    title: "On-Field Technique & Position Drills",
    category: "Academy Training",
    imageUrl: "/images/IMG_1960.jpeg",
    objectPosition: "object-[center_12%]",
  },
  {
    id: 6,
    title: "Elite Pacific Camp Field Session",
    category: "Queensland Training Camp",
    imageUrl: "/images/coach_shaka.jpeg",
    objectPosition: "object-[center_10%]",
  },
];

export function MediaCarousel() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* 7 Cols: Real Photo Carousel */}
      <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-[#111111] border border-white/10 group h-96 md:h-[460px]">
        <div className="relative w-full h-full">
          <Image
            src={slides[currentIndex].imageUrl}
            alt={slides[currentIndex].title}
            fill
            unoptimized
            className={`object-cover transition-all duration-500 group-hover:scale-102 ${
              slides[currentIndex].objectPosition || "object-center"
            }`}
            priority
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

          {/* Caption Overlay */}
          <div className="absolute bottom-6 left-6 right-20 z-10">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
              {slides[currentIndex].category}
            </span>
            <h3 className="font-display uppercase text-xl md:text-2xl font-bold text-white leading-tight">
              {slides[currentIndex].title}
            </h3>
            <span className="text-[11px] text-[#A3A3A3] mt-1 block">
              Photo {currentIndex + 1} of {slides.length}
            </span>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white border border-white/15 hover:bg-[#F21717] hover:border-[#F21717] transition-colors z-20 cursor-pointer shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white border border-white/15 hover:bg-[#F21717] hover:border-[#F21717] transition-colors z-20 cursor-pointer shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 right-6 flex items-center gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? "w-6 bg-[#F21717]"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 5 Cols: Real Video Player */}
      <div className="lg:col-span-5 rounded-2xl bg-[#111111] border border-white/10 flex flex-col justify-between p-5 md:p-6 h-96 md:h-[460px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#F21717]" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#F21717]">
              FEATURED CAMP VIDEO
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-[#737373] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            title="Expand video"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Expand</span>
          </button>
        </div>

        {/* Embedded HTML5 Video Player playing video.mov */}
        <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10 bg-black mb-3">
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            poster="/images/athletes_team.jpeg"
            className="w-full h-full object-cover"
          >
            <source src="/images/video.mov" type="video/quicktime" />
            <source src="/images/video.mov" type="video/mp4" />
            <source src="/images/IMG_7333.mov" type="video/quicktime" />
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        {/* Video Details */}
        <div>
          <h4 className="font-display uppercase text-lg font-bold text-white leading-tight">
            Elite Pacific & REP 1 Camp Highlights
          </h4>
          <p className="text-xs text-[#A3A3A3] mt-1 line-clamp-2">
            Live on-field video footage from the athlete combine showcase and position training drills.
          </p>
        </div>

        {/* Fullscreen Video Modal Popup */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141414]">
                <span className="font-display uppercase text-sm font-bold text-white">
                  Elite Pacific & REP 1 Camp Footage
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                <video
                  controls
                  autoPlay
                  playsInline
                  poster="/images/athletes_team.jpeg"
                  className="w-full h-full object-contain"
                >
                  <source src="/images/video.mov" type="video/quicktime" />
                  <source src="/images/video.mov" type="video/mp4" />
                  <source src="/images/IMG_7333.mov" type="video/quicktime" />
                  Your browser does not support HTML5 video.
                </video>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
