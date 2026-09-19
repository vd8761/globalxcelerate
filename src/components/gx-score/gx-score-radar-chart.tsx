'use client';

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { DIMENSION_DEFINITIONS } from '@/lib/ai/constants/gx-dimensions';

interface GXScoreRadarChartProps {
  dimensions: Record<string, number>;
}

export function GXScoreRadarChart({ dimensions }: GXScoreRadarChartProps) {
  const chartData = useMemo(() => {
    return DIMENSION_DEFINITIONS.map(dim => ({
      dimension: dim.label.replace(' ', '\n'),
      score: dimensions[dim.id] || 0,
      fullMark: 100,
    }));
  }, [dimensions]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-navy-900 mb-4">Dimension Overview</h3>
      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#1E293B" strokeOpacity={0.2} />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#94A3B8', fontSize: 9 }}
            />
            <Radar
              name="GX Score"
              dataKey="score"
              stroke="#0891B2"
              fill="#06B6D4"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
