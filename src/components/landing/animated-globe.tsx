"use client";

import { cn } from "@/lib/utils";

interface AnimatedGlobeProps {
  className?: string;
}

export function AnimatedGlobe({ className }: AnimatedGlobeProps) {
  const nodes = [
    { cx: 280, cy: 160, label: "London" },
    { cx: 320, cy: 200, label: "Dubai" },
    { cx: 370, cy: 180, label: "Mumbai" },
    { cx: 410, cy: 160, label: "Singapore" },
    { cx: 430, cy: 140, label: "Tokyo" },
    { cx: 260, cy: 170, label: "Berlin" },
    { cx: 160, cy: 150, label: "New York" },
    { cx: 420, cy: 230, label: "Sydney" },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [3, 7], [2, 7], [6, 0], [1, 3],
  ];

  return (
    <div className={cn("relative flex items-center justify-center", className)} aria-hidden="true">
      {/* Radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.08)_0%,_transparent_70%)]" />

      <svg
        viewBox="0 0 500 400"
        className="w-[250px] md:w-[300px] lg:w-[400px] h-auto globe-float"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Globe circle */}
        <circle
          cx="300"
          cy="200"
          r="140"
          stroke="url(#globeGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        <circle
          cx="300"
          cy="200"
          r="120"
          stroke="#0F172A"
          strokeWidth="0.5"
          fill="none"
          opacity="0.15"
        />

        {/* Latitude lines */}
        <g className="globe-rotate" opacity="0.12" stroke="#0F172A" strokeWidth="0.5">
          <ellipse cx="300" cy="200" rx="140" ry="40" />
          <ellipse cx="300" cy="200" rx="140" ry="80" />
          <ellipse cx="300" cy="200" rx="140" ry="110" />
          <ellipse cx="300" cy="160" rx="130" ry="30" />
          <ellipse cx="300" cy="240" rx="130" ry="30" />
        </g>

        {/* Longitude lines */}
        <g className="globe-rotate-reverse" opacity="0.1" stroke="#0F172A" strokeWidth="0.5">
          <ellipse cx="300" cy="200" rx="40" ry="140" />
          <ellipse cx="300" cy="200" rx="80" ry="140" />
          <ellipse cx="300" cy="200" rx="110" ry="140" />
        </g>

        {/* Connection lines */}
        {connections.map(([from, to], i) => (
          <line
            key={`conn-${i}`}
            x1={nodes[from].cx}
            y1={nodes[from].cy}
            x2={nodes[to].cx}
            y2={nodes[to].cy}
            stroke="#2563EB"
            strokeWidth="1"
            opacity="0.35"
            strokeDasharray="4 4"
            className="connection-dash"
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={node.cx}
              cy={node.cy}
              r="4"
              fill="#06B6D4"
              className="node-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            <circle
              cx={node.cx}
              cy={node.cy}
              r="8"
              fill="#06B6D4"
              opacity="0.2"
              className="node-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          </g>
        ))}

        {/* Gradient defs */}
        <defs>
          <linearGradient id="globeGradient" x1="160" y1="60" x2="440" y2="340">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
