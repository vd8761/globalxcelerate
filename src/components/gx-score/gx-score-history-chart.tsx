'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface HistoryEntry {
  date: string;
  score: number;
}

interface GXScoreHistoryChartProps {
  history: HistoryEntry[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: HistoryEntry }> }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const prevIdx = entry.payload ? -1 : 0;
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-3">
      <p className="text-xs text-slate-500">{new Date(entry.payload.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      <p className="text-lg font-bold text-slate-900">{entry.value.toFixed(1)}</p>
    </div>
  );
}

export function GXScoreHistoryChart({ history }: GXScoreHistoryChartProps) {
  const chartData = useMemo(() => {
    return history.map((entry, idx) => ({
      ...entry,
      label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      delta: idx > 0 ? entry.score - history[idx - 1].score : 0,
    }));
  }, [history]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Score History</h3>
      <div className="h-48 md:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#0891B2"
              strokeWidth={2}
              fill="#CFFAFE"
              fillOpacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
