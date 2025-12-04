"use client";

import DashboardCard from "@/components/ui/DashboardCard";
import Weather from "@/components/Weather";

export default function Dashboard() {
  return (
    <div className="bg-background text-secondary. grid grid-cols-2">
      <DashboardCard className="">
        <Weather />
      </DashboardCard>
    </div>
  );
}
