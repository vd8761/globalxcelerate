"use client";

import { Info } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const dimensions = [
  { label: "Technical Skills", score: 86, color: "bg-blue-500" },
  { label: "Communication", score: 72, color: "bg-cyan-500" },
  { label: "Industry Experience", score: 65, color: "bg-amber-500" },
  { label: "International Exposure", score: 82, color: "bg-emerald-500" },
  { label: "Portfolio Quality", score: 79, color: "bg-purple-500" },
  { label: "Leadership", score: 84, color: "bg-indigo-500" },
];

export function GXScorePreview() {
  const { ref, isInView } = useScrollReveal();

  const circumference = 2 * Math.PI * 70;
  const scorePercent = 78;
  const dashOffset = circumference - (scorePercent / 100) * circumference;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Score card */}
          <ScrollReveal direction="left">
            <div ref={ref} className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
              {/* Circle score */}
              <div className="flex flex-col items-center">
                <div className="relative w-44 h-44">
                  <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                    <circle
                      cx="80" cy="80" r="70" fill="none"
                      stroke="url(#gxGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={isInView ? dashOffset : circumference}
                      className="transition-[stroke-dashoffset] duration-[1500ms] ease-out"
                    />
                    <defs>
                      <linearGradient id="gxGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-slate-900">78</span>
                    <span className="text-sm text-slate-400">/100</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-3">Your GX Score</p>
              </div>

              {/* Dimensions */}
              <div className="mt-8 space-y-4">
                {dimensions.map((dim) => (
                  <div key={dim.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-700">{dim.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{dim.score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dim.color} transition-all duration-1000 ease-out`}
                        style={{ width: isInView ? `${dim.score}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Content */}
          <ScrollReveal direction="right" delay={200}>
            <div>
              <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
                GX Readiness Score
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 font-body tracking-tight">
                Measure Your Global Readiness
              </h2>
              <p className="text-lg text-slate-600 mt-4 leading-relaxed">
                The GX Score is your personal readiness framework — not a ranking. Understand your strengths across 6 key dimensions and get actionable insights to grow.
              </p>

              {/* Info callout */}
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700">
                  This is a readiness framework, not a ranking. Your score helps guide your growth journey.
                </p>
              </div>

              {/* Feature points */}
              <div className="mt-6 space-y-3">
                {[
                  { color: "bg-blue-500", text: "Personalized improvement recommendations" },
                  { color: "bg-emerald-500", text: "Track progress over time" },
                  { color: "bg-purple-500", text: "Benchmark against opportunity requirements" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
