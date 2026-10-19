"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/admin/ui/chart";

const config = { count: { label: "לידים", color: "var(--chart-1)" } } satisfies ChartConfig;

const dayLabel = (day: string) => {
  const [, m, d] = day.split("-");
  return `${Number(d)}.${Number(m)}`;
};

/** לידים ליום — 30 הימים האחרונים. ציר הזמן הפוך (RTL): היום בצד שמאל. */
export function LeadsChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <BarChart data={data} margin={{ top: 8, left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          reversed
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={dayLabel}
        />
        <YAxis orientation="right" allowDecimals={false} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent labelFormatter={(v) => dayLabel(String(v))} indicator="dot" />}
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={18} animationDuration={500} />
      </BarChart>
    </ChartContainer>
  );
}
