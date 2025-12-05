"use client";

import { useRandomFlightData } from "@/lib/hooks";

export default function Flight() {
  const { data } = useRandomFlightData();

  if (!data?.flight) return <div>No flight found</div>;

  return <div>{data.flight.callsign}</div>;
}
