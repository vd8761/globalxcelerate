"use client";

import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-4 md:px-8 text-center">
        <ScrollReveal direction="up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight font-body tracking-tight">
            Your global career starts here.
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={100}>
          <p className="text-lg md:text-xl text-blue-100 mt-4">
            Join thousands of students who are building international careers with AI-powered guidance.
          </p>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={200}>
          <Link
            href="/register"
            className="inline-flex items-center bg-white text-blue-700 px-10 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 mt-8"
          >
            Get Started — It&apos;s Free
          </Link>
          <p className="text-sm text-blue-200 mt-4">No credit card required</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
