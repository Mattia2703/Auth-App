"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface Rate {
  date: string;
  rate: number;
}

interface ExchangeChartProps {
  data: {
    success: boolean;
    base: string;
    startDate: string;
    endDate: string;
    rates: Rate[];
  } | null;
}

export default function ExchangeLineChart({ data }: ExchangeChartProps) {
  if (!data || !data.rates.length) return <div>No data</div>;

  const latestRate = data.rates[data.rates.length - 1].rate;

  // Get min and max for Y-axis scaling
  const rates = data.rates.map((r) => r.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);

  return (
    <div style={{ width: "100%", height: 200, position: "relative" }}>
      <div className="absolute top-2 left-2 font-semibold text-2xl z-10">
        1€ = {latestRate.toFixed(2)} $
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data.rates}
          margin={{ top: 40, right: 0, bottom: 0, left: 0 }}
        >
          <YAxis domain={[minRate, maxRate]} hide={true} />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="var(--tertiary)"
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
