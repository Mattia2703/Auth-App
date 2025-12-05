import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import type { paths } from "@/types/api";

// Extract types from types.ts
type WeatherResponse =
  paths["/api/data/weather"]["get"]["responses"]["200"]["content"]["application/json"];
type ExchangeResponse =
  paths["/api/data/exchange"]["get"]["responses"]["200"]["content"]["application/json"];
type FlightResponse =
  paths["/api/data/flight"]["get"]["responses"]["200"]["content"]["application/json"];
type RandomFlightResponse =
  paths["/api/data/random-flight"]["get"]["responses"]["200"]["content"]["application/json"];

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(latitude?: number, longitude?: number) {
  const [state, setState] = useState<UseApiState<WeatherResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchWeather = async (lat: number, lon: number) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data, error } = await api.weather.getCurrent({
        latitude: lat,
        longitude: lon,
      });

      if (error) {
        throw new Error("Failed to fetch weather");
      }

      setState({ data: data || null, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch weather",
      });
    }
  };

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      fetchWeather(latitude, longitude);
    }
  }, [latitude, longitude]);

  return { ...state, refetch: fetchWeather };
}

export function useExchangeRates(startDate?: string, endDate?: string) {
  const [state, setState] = useState<UseApiState<ExchangeResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchRates = async (start: string, end: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data, error } = await api.exchange.getRates({
        startDate: start,
        endDate: end,
      });

      if (error) {
        throw new Error("Failed to fetch exchange rates");
      }

      setState({ data: data || null, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch exchange rates",
      });
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchRates(startDate, endDate);
    }
  }, [startDate, endDate]);

  return { ...state, refetch: fetchRates };
}

export function useFlightData(flightNumber?: string) {
  const [state, setState] = useState<UseApiState<FlightResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchFlight = async (flight: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data, error } = await api.flight.getData({
        flightNumber: flight,
      });

      if (error) {
        throw new Error("Failed to fetch flight data");
      }

      setState({ data: data || null, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch flight data",
      });
    }
  };

  useEffect(() => {
    if (flightNumber) {
      fetchFlight(flightNumber);
    }
  }, [flightNumber]);

  return { ...state, refetch: fetchFlight };
}

export function useRandomFlightData() {
  const [state, setState] = useState<UseApiState<RandomFlightResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchFlight = async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data, error } = await api.randomFlight.getData();

      if (error) {
        throw new Error("Failed to fetch flight data");
      }

      setState({ data: data || null, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch flight data",
      });
    }
  };

  useEffect(() => {
    fetchFlight();
  }, []);

  return { ...state, refetch: fetchFlight };
}
