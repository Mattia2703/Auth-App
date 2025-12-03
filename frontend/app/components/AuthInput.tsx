import { Input } from "@/components/Input";
import { cn } from "@/lib/utils";
import React from "react";

export default function AuthInput({
  className,
  type,
  title,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div>
      <h2 className="text-md font-semibold text-secondary pb-2">{title}</h2>
      <Input
        placeholder={title}
        className={cn(className, "text-secondary bg-primary")}
        type={type}
        {...props}
      />
    </div>
  );
}
