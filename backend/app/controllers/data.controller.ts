import { Request, Response } from "express";

/**
 * Get current weather data for a location
 * Uses Open-Meteo API (free, no API key required)
 */

export const getCurrentWeather = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
        example: "/api/data/weather?latitude=52.52&longitude=13.41",
      });
    }

    // Validate latitude and longitude ranges
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);

    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude values",
        details:
          "Latitude must be between -90 and 90, longitude between -180 and 180",
      });
    }

    // Call Open-Meteo API
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m`
    );

    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const weatherData = await response.json();

    // Format the response
    return res.status(200).json({
      success: true,
      location: {
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
        timezone: weatherData.timezone,
      },
      current: {
        time: weatherData.current.time,
        temperature: {
          value: weatherData.current.temperature_2m,
          unit: weatherData.current_units.temperature_2m,
        },
        apparentTemperature: {
          value: weatherData.current.apparent_temperature,
          unit: weatherData.current_units.apparent_temperature,
        },
        humidity: {
          value: weatherData.current.relative_humidity_2m,
          unit: weatherData.current_units.relative_humidity_2m,
        },
        precipitation: {
          value: weatherData.current.precipitation,
          unit: weatherData.current_units.precipitation,
        },
        weatherCode: weatherData.current.weather_code,
        wind: {
          speed: {
            value: weatherData.current.wind_speed_10m,
            unit: weatherData.current_units.wind_speed_10m,
          },
          direction: {
            value: weatherData.current.wind_direction_10m,
            unit: weatherData.current_units.wind_direction_10m,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get EUR to USD exchange rate
 * Uses exchangerate.host API (free, no API key required)
 */

export const getEURtoUSDRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate query parameters are required",
        example:
          "/api/data/exchange-range?startDate=2025-11-25&endDate=2025-12-01",
      });
    }

    const url = `https://api.frankfurter.app/${startDate}..${endDate}?from=EUR&to=USD`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Frankfurter API responded with status ${response.status}`
      );
    }

    const data = await response.json();

    // Format data for charting
    const chartData = Object.entries(data.rates).map(([date, rateObj]) => {
      const rates = rateObj as Record<string, number> | undefined;
      return {
        date,
        rate: rates ? rates["USD"] : null,
      };
    });

    return res.status(200).json({
      success: true,
      base: data.base,
      startDate,
      endDate,
      rates: chartData,
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exchange rates",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get current flight data by flight number (callsign)
 * Uses OpenSky Network API (free, no API key required)
 */

export const getFlightByNumber = async (req: Request, res: Response) => {
  try {
    const { flightNumber } = req.query;

    if (!flightNumber) {
      return res.status(400).json({
        message: "flightNumber query parameter is required",
        example: "/api/data/flight?flightNumber=LH1234",
      });
    }

    // OpenSky endpoint for all states (no API key required)
    const response = await fetch("https://opensky-network.org/api/states/all");

    if (!response.ok) {
      throw new Error(`OpenSky API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Filter flights by callsign (flight number)
    const flightData = data.states
      .filter((state: any) => state[1]?.trim() === flightNumber)
      .map((state: any) => ({
        icao24: state[0],
        callsign: state[1]?.trim(),
        origin_country: state[2],
        time_position: state[3],
        last_contact: state[4],
        longitude: state[5],
        latitude: state[6],
        baro_altitude: state[7],
        on_ground: state[8],
        velocity: state[9],
        true_track: state[10],
        vertical_rate: state[11],
      }));

    if (flightData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No current flight found with number ${flightNumber}`,
      });
    }

    return res.status(200).json({
      success: true,
      flights: flightData,
    });
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch flight data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getRandomFlight = async (req: Request, res: Response) => {
  try {
    const response = await fetch("https://opensky-network.org/api/states/all");

    if (!response.ok) {
      throw new Error(`OpenSky API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.states || data.states.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No flights currently available",
      });
    }

    // Pick a random flight
    const randomIndex = Math.floor(Math.random() * data.states.length);
    const state = data.states[randomIndex];

    const flightData = {
      icao24: state[0],
      callsign: state[1]?.trim(),
      origin_country: state[2],
      time_position: state[3],
      last_contact: state[4],
      longitude: state[5],
      latitude: state[6],
      baro_altitude: state[7],
      on_ground: state[8],
      velocity: state[9],
      true_track: state[10],
      vertical_rate: state[11],
    };

    return res.status(200).json({
      success: true,
      flight: flightData,
    });
  } catch (error) {
    console.error("Error fetching flight data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch flight data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
