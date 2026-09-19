"use client";

import { GraduationCap, Building2, CheckCircle } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const universityBenefits = [
  "Track student mobility and international placements",
  "Centralized opportunity management dashboard",
  "Analytics on student outcomes and engagement",
  "Branded institutional presence for your programs",
  "Seamless integration with existing student systems",
];

const employerBenefits = [
  "Access pre-vetted global talent pipeline",
  "AI-matched candidates for your requirements",
  "Streamlined application and selection process",
  "Diverse international candidate pool",
  "Employer branding and program showcasing",
];

export function PartnersSection() {
  return (
    <section id="universities" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal direction="up">
            <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
              For Partners
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 font-body tracking-tight">
              Empowering Universities & Employers
            </h2>
            <p className="text-lg text-slate-600 mt-4">
              A platform built for every stakeholder in the global education ecosystem.
            </p>
          </ScrollReveal>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          {/* Universities */}
          <ScrollReveal direction="left" delay={100}>
            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-body">For Universities</h3>
              </div>
              <div className="mt-6 space-y-4">
                {universityBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Employers */}
          <ScrollReveal direction="right" delay={200}>
            <div id="employers" className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 h-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-body">For Employers</h3>
              </div>
              <div className="mt-6 space-y-4">
                {employerBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
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
