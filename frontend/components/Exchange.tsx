"use client";

import { useExchangeRates } from "@/lib/hooks";
import ExchangeLineChart from "./ExchangeLineChart";

export default function Exchange() {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 100);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const { data } = useExchangeRates(formatDate(oneWeekAgo), formatDate(today));

  if (!data) return <div>No Exchange Data</div>;

  return (
    <div>
      <ExchangeLineChart data={data} />
    </div>
  );
}
