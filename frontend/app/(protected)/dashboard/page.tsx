"use client";

import Exchange from "@/components/Exchange";
import Flight from "@/components/Flight";
import DashboardCard from "@/components/ui/DashboardCard";
import Weather from "@/components/Weather";

export default function Dashboard() {
  return (
    <div className="bg-background grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
      <DashboardCard className="">
        <Weather />
      </DashboardCard>
      <DashboardCard className="">
        <Flight />
      </DashboardCard>
      <DashboardCard className="">
        <Exchange />
      </DashboardCard>
    </div>
  );
}
