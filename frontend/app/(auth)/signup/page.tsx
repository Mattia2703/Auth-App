"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import AuthInput from "@/components/ui/AuthInput";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password || !email) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    try {
      await register(username, email, password);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Sign Up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background items-center justify-center">
      <div className="px-8 py-24 rounded-md border-tertiary border glow flex flex-col gap-6 w-4/5 md:w-3/5 lg:w-1/3">
        <h1 className="text-primary text-3xl font-bold">Sign Up</h1>
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
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            title="Email"
            type="email"
          />
          <AuthInput
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            title="Password"
            type="password"
          />
          <Button disabled={loading} variant="secondary">
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
        <div className="text-primary w-full flex justify-center items-center text-sm">
          <Link href={"/signin"} className="flex flex-row flex-wrap gap-1">
            <div className="text-nowrap">Already have an Account?</div>
            <div className="text-tertiary">Sign In</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
