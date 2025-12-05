"use client";

import { useWeather } from "@/lib/hooks";
import { weatherIcons } from "@/lib/weathericons";
import { LiaLocationArrowSolid } from "react-icons/lia";

export default function Weather() {
  const { data } = useWeather(48.35, 11.79);

  if (!data) return undefined;

  return (
    <div className="grid grid-cols-2 font-semibold">
      <div className="flex flex-col justify-between">
        <div>City: Munich</div>
        <div>Lat: {data.location.latitude.toFixed(2)}</div>
        <div>Lng: {data.location.longitude.toFixed(2)}</div>
        <div>Timezone: {data.location.timezone}</div>
        <div className="text-5xl">{weatherIcons[data.current.weatherCode]}</div>
      </div>
      <div className="flex flex-col gap-1">
        <div>
          Temp:{" "}
          {data.current.temperature.value + " " + data.current.temperature.unit}
        </div>
        <div>
          Feels like:{" "}
          {data.current.apparentTemperature.value +
            " " +
            data.current.apparentTemperature.unit}
        </div>
        <div>
          Humidity: {data.current.humidity.value + data.current.humidity.unit}
        </div>
        <div>
          Wind:{" "}
          {data.current.wind.direction.value +
            data.current.wind.direction.unit +
            " " +
            data.current.wind.speed.value +
            " " +
            data.current.wind.speed.unit}
        </div>
        <div className="text-5xl">
          <LiaLocationArrowSolid
            style={{
              transform: `rotate(${data.current.wind.direction.value}deg)`,
              transition: "transform 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
