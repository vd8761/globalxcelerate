"use client";

import Link from "next/link";
import { AnimatedGlobe } from "./animated-globe";
import { ScrollReveal } from "./scroll-reveal";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-100/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <div className="max-w-xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                AI-Powered Career Platform
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight font-body">
                Build Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Global Career.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <p className="text-lg md:text-xl text-slate-600 mt-6 leading-relaxed">
                Connect with world-class internships, exchanges, and graduate opportunities across 40+ countries. AI-powered matching to find your perfect global experience.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300}>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/register"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Build My Global Profile
                </Link>
                <a
                  href="#opportunities"
                  className="inline-flex items-center border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Explore Opportunities
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={400}>
              <p className="text-sm text-slate-500 mt-6">
                Join 50,000+ students building global careers
              </p>
            </ScrollReveal>
          </div>

          {/* Right globe */}
          <ScrollReveal direction="right" delay={300} className="hidden md:flex justify-center lg:justify-end">
            <AnimatedGlobe />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
