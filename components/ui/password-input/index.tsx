"use client";

import { useState } from "react";
import { LucideEye, LucideEyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

/**
 * Password field with a reveal toggle, mirroring the pattern on /login.
 * Forwards the ref so react-hook-form's register() works unchanged.
 */
export default function PasswordInput({ className, ...props }: PasswordInputProps) {
  const t = useT("settings");
  const [visible, setVisible] = useState(false);

  return (
    <div className="group relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t.hidePassword : t.showPassword}
        className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
      >
        {visible ? <LucideEyeOff className="size-4" /> : <LucideEye className="size-4" />}
      </button>
    </div>
  );
}
