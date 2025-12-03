"use client";

import { useWeather } from "@/lib/hooks";

export default function Dashboard() {
  const { data } = useWeather();

  return <div className="min-h-screen bg-primary text-secondary"></div>;
}
