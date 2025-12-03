import { apiClient } from "./apiClient";

export async function getWeather() {
  const data = await apiClient.get(
    "/data/weather?latitude=48.1351&longitude=11.5820"
  );
  return data;
}
