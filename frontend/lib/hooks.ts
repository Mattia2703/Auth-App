import { useEffect, useState } from "react";
import { getWeather } from "@/lib/fetcher";

export function useWeather() {
  const [data, setData] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>();

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getWeather();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
