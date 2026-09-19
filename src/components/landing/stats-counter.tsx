"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { ScrollReveal } from "./scroll-reveal";

const stats = [
  { end: 50000, label: "Active Students" },
  { end: 5000, label: "Opportunities" },
  { end: 200, label: "Partner Universities" },
  { end: 40, label: "Countries" },
];

function StatItem({ end, label, delay }: { end: number; label: string; delay: number }) {
  const { ref, isInView } = useScrollReveal();
  const value = useAnimatedCounter(end, 2000, isInView);

  const formatted = new Intl.NumberFormat("en-US").format(value);

  return (
    <ScrollReveal direction="up" delay={delay}>
      <div ref={ref} className="text-center py-4">
        <div className="text-3xl md:text-4xl font-bold text-slate-900 font-body">
          {formatted}<span className="text-blue-600">+</span>
        </div>
        <div className="text-sm md:text-base text-slate-600 mt-1">{label}</div>
      </div>
    </ScrollReveal>
  );
}

export function StatsCounter() {
  return (
    <section className="py-16 md:py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} end={stat.end} label={stat.label} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
