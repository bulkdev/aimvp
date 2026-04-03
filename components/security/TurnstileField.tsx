"use client";

import { Turnstile } from "@marsidev/react-turnstile";

type Props = {
  onToken: (token: string | null) => void;
  theme?: "light" | "dark" | "auto";
};

export function TurnstileField({ onToken, theme = "auto" }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <div className="flex justify-center min-h-[65px]">
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => onToken(token)}
        onExpire={() => onToken(null)}
        onError={() => onToken(null)}
        options={{ theme }}
      />
    </div>
  );
}
