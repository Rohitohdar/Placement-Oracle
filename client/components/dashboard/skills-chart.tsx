"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type SkillsChartProps = {
  data: Array<{ skill: string; score: number }>;
};

export function SkillsChart({ data }: SkillsChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={34}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="skill"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#d8d4fe", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#d8d4fe", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.94)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "18px",
              color: "#fff"
            }}
          />
          <Bar dataKey="score" radius={[14, 14, 0, 0]} fill="url(#skillsGradient)" />
          <defs>
            <linearGradient id="skillsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
