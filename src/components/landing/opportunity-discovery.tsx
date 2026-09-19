"use client";

import {
  Briefcase,
  Globe,
  ArrowLeftRight,
  Lightbulb,
  Microscope,
  GraduationCap,
  Rocket,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const opportunities = [
  {
    icon: Briefcase,
    title: "Internships",
    description: "Gain hands-on experience with leading global companies across industries.",
  },
  {
    icon: Globe,
    title: "Global Immersion",
    description: "Immerse yourself in new cultures through structured international programs.",
  },
  {
    icon: ArrowLeftRight,
    title: "Student Exchange",
    description: "Study at partner universities worldwide and broaden your perspective.",
  },
  {
    icon: Lightbulb,
    title: "Industry Projects",
    description: "Collaborate on real-world projects with multinational organizations.",
  },
  {
    icon: Microscope,
    title: "Research",
    description: "Join international research teams at cutting-edge institutions.",
  },
  {
    icon: GraduationCap,
    title: "Scholarships",
    description: "Access funding for your global education and career development.",
  },
  {
    icon: Rocket,
    title: "Graduate Careers",
    description: "Launch your career with graduate roles at top international employers.",
  },
];

export function OpportunityDiscovery() {
  return (
    <section id="opportunities" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal direction="up">
            <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
              Explore Opportunities
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 font-body tracking-tight">
              Discover Global Opportunities
            </h2>
            <p className="text-lg text-slate-600 mt-4">
              From internships to scholarships, find the perfect opportunity to launch your international career.
            </p>
          </ScrollReveal>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
          {opportunities.map((item, i) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.title} direction="up" delay={i * 80}>
                <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mt-4 font-body">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                  <span className="inline-block text-sm text-blue-600 font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more →
                  </span>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
