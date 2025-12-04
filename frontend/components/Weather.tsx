"use client";

import { useWeather } from "@/lib/hooks";
import React from "react";

export default function Weather() {
  const { data } = useWeather();
  return <div>Weather</div>;
}
