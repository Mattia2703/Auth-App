import React from "react";
import { Card, CardContent, CardTitle } from "./Card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function DashboardCard({
  className,
  children,
  title,
}: DashboardCardProps) {
  return (
    <Card className={cn(className, "grow glow border-tertiary border")}>
      {title && <CardTitle>{title}</CardTitle>}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
