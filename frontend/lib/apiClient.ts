import { refreshTokenAction } from "./authActions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(newAccessToken: string) {
    this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
    this.refreshSubscribers = [];
  }

  private async refreshAccessToken(): Promise<string | null> {
    const result = await refreshTokenAction();

    if (!result.success) {
      // Refresh failed, redirect to login
      window.location.href = "/login";
      return null;
    }

    return result.accessToken || null;
  }

  async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Note: Don't need to manually add Authorization header as httpOnly cookies are automatically sent with the request
    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Here we send the cookies with the request
    });

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      if (this.isRefreshing) {
        // Wait for ongoing refresh to complete
        return new Promise((resolve, reject) => {
          this.subscribeTokenRefresh(() => {
            fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers,
              credentials: "include",
            })
              .then(resolve)
              .catch(reject);
          });
        });
      }

      this.isRefreshing = true;

      try {
        const newAccessToken = await this.refreshAccessToken();
        this.isRefreshing = false;

        if (!newAccessToken) {
          throw new Error("Token refresh failed");
        }

        // Notify subscribers
        this.onTokenRefreshed(newAccessToken);

        // Retry original request
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
      } catch (error) {
        this.isRefreshing = false;
        throw error;
      }
    }

    return response;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request(endpoint, { method: "GET" });
    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
