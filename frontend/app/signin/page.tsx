"use client";
import { useState } from "react";
import AuthInput from "../components/AuthInput";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      await login(username, password);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-primary items-center justify-center">
      <div className="px-8 py-12 rounded-md border-tertiary border glow flex flex-col gap-6 w-2/3 md:w-1/3">
        <h1 className="text-secondary text-3xl font-bold">Sign In</h1>
        {error && (
          <h2 className="text-warning font-semibold text-md">{error}</h2>
        )}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <AuthInput
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            title="Username"
          />
          <AuthInput
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            title="Password"
            type="password"
          />
          <Button disabled={loading} variant="secondary">
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <div className="text-secondary w-full flex justify-center items-center text-sm">
          <Link href={"/signup"} className="flex flex-row flex-wrap gap-1">
            <div className="text-nowrap">Don&apos;t have an Account?</div>
            <div className="text-tertiary">Sign Up</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
