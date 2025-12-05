import createClient from "openapi-fetch";
import type { paths } from "@/types/api";
import { refreshTokenAction } from "./authActions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const client = createClient<paths>({
  baseUrl: API_URL,
  credentials: "include",
});

// Token refresh state
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function handleTokenRefresh() {
  if (isRefreshing) {
    // Wait for ongoing refresh
    return new Promise<string>((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });
  }

  isRefreshing = true;
  try {
    const result = await refreshTokenAction();

    if (!result.success) {
      window.location.href = "/login";
      throw new Error("Token refresh failed");
    }

    const newToken = result.accessToken || "";
    onTokenRefreshed(newToken);
    return newToken;
  } finally {
    isRefreshing = false;
  }
}

// Intercept responses to handle 401 and 403 errors
client.use({
  async onResponse({ request, response, options }) {
    if (response.status === 401 || response.status === 403) {
      try {
        // 1. Get the new token (waits if a refresh is already in progress)
        const newToken = await handleTokenRefresh();

        // 2. Clone the headers from the original request
        const headers = new Headers(request.headers);

        // 3. Update the Authorization header
        headers.set("Authorization", `Bearer ${newToken}`);

        // 4. RETRY the request manually using global fetch
        // We pass the original URL and updated options
        const newResponse = await fetch(request.url, {
          ...options, // Keep original options (method, body, etc.)
          headers, // Use updated headers
        });

        return newResponse;
      } catch (error) {
        console.error("Token refresh failed during retry:", error);
        return response;
      }
    }
    // If not 401/403, return undefined to let the original response pass through
    return undefined;
  },
});

// Export typed API methods with automatic retry
const api = {
  // Auth endpoints
  auth: {
    signup: (data: { username: string; email: string; password: string }) =>
      client.POST("/api/auth/signup", { body: data }),

    signin: (data: { username: string; password: string }) =>
      client.POST("/api/auth/signin", { body: data }),

    refresh: (data: { refreshToken: string }) =>
      client.POST("/api/auth/refresh", { body: data }),
  },

  // Weather endpoint
  weather: {
    getCurrent: (params: { latitude: number; longitude: number }) =>
      client.GET("/api/data/weather", { params: { query: params } }),
  },

  // Exchange rates endpoint
  exchange: {
    getRates: (params: { startDate: string; endDate: string }) =>
      client.GET("/api/data/exchange", { params: { query: params } }),
  },

  // Flight data endpoint
  flight: {
    getData: (params: { flightNumber: string }) =>
      client.GET("/api/data/flight", { params: { query: params } }),
  },
  randomFlight: {
    getData: () => client.GET("/api/data/random-flight"),
  },
};

export { client, api };
