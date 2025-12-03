"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface LoginResponse {
  id: string;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
}

export async function loginAction(username: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Login failed" };
    }

    const data: LoginResponse = await response.json();

    // Set httpOnly cookies (server-side only, JavaScript can't access them)
    const cookieStore = await cookies();

    // Access token
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 20, // 20 minutes
      path: "/",
    });

    // Refresh token
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14, // 14 days
      path: "/",
    });

    // Store user data in a non-httpOnly cookie so client can access it
    cookieStore.set(
      "user",
      JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 14, // 14 days
        path: "/",
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function registerAction(
  username: string,
  email: string,
  password: string
) {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Registration failed" };
    }

    // After successful registration, log the user in
    return await loginAction(username, password);
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();

  // Delete all auth cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("user");

  redirect("/signin");
}

export async function refreshTokenAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return { success: false, error: "No refresh token available" };
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh failed, clear cookies
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      cookieStore.delete("user");
      return { success: false, error: "Token refresh failed" };
    }

    const data = await response.json();

    // Update tokens
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 20, // 20 minutes
      path: "/",
    });

    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14, // 14 days
      path: "/",
    });

    return { success: true, accessToken: data.accessToken };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}
