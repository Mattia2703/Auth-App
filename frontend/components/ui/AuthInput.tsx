import { Input } from "@/components/ui/Input";
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
      <h2 className="text-md font-semibold text-primary pb-2">{title}</h2>
      <Input
        placeholder={title}
        className={cn(className)}
        type={type}
        {...props}
      />
    </div>
  );
}
