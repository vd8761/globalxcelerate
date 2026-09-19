"use client";

import { Check, CheckCircle, Circle } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const matchCriteria = [
  { label: "Python Proficiency", score: 95, met: true },
  { label: "Data Science Skills", score: 88, met: true },
  { label: "Singapore Preference", score: 100, met: true },
  { label: "Graduation Year Match", score: 100, met: true },
  { label: "Industry Experience", score: 60, met: false },
];

export function AIMatchingPreview() {
  return (
    <section id="features" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <ScrollReveal direction="left">
            <div>
              <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
                AI-Powered Matching
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 font-body tracking-tight">
                Find Your Perfect Opportunity
              </h2>
              <p className="text-lg text-slate-600 mt-4 leading-relaxed">
                Our AI engine analyzes your skills, preferences, and goals to match you with opportunities where you&apos;ll thrive. No more endless searching — we bring the right opportunities to you.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Personalized matches based on your unique profile",
                  "Real-time scoring as new opportunities appear",
                  "Transparent criteria — see why you matched",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right match card */}
          <ScrollReveal direction="right" delay={200}>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Match Score</span>
                <span className="text-xs text-slate-400">Updated 2 hours ago</span>
              </div>

              {/* Score ring */}
              <div className="flex items-center gap-6 mt-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="url(#matchGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${91 * 2.136} ${100 * 2.136}`}
                    />
                    <defs>
                      <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900">91%</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Data Science Internship — Singapore</p>
                  <p className="text-sm text-slate-500 mt-0.5">TechCorp Asia</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 my-6" />

              {/* Breakdown */}
              <div className="space-y-4">
                {matchCriteria.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {item.met ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="text-sm text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-500">{item.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          item.met ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
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
