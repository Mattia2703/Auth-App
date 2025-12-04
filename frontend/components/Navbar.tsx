"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Switch } from "./ui/Switch";

export default function Navbar() {
  const { logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex w-full py-6 px-5 items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <div className="font-semibold text-lg">Home</div>
        </Link>
        <div
          className="font-semibold text-lg hover:cursor-pointer"
          onClick={logout}
        >
          Logout
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">
          {resolvedTheme === "light" ? "Light" : "Dark"}
        </span>

        <Switch
          checked={resolvedTheme === "dark"}
          onCheckedChange={() =>
            setTheme(resolvedTheme === "light" ? "dark" : "light")
          }
        />
      </div>
    </div>
  );
}
