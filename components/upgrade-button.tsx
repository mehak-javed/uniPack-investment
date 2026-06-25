"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UpgradeButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function upgrade() {
    setError("");
    start(async () => {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (res.status === 401) return router.push("/login");
      if (data.url) {
        window.location.href = data.url; // off to Stripe Checkout
        return;
      }
      setError(data.error ?? "Could not start checkout.");
    });
  }

  return (
    <div className={className}>
      <Button onClick={upgrade} disabled={pending} className="w-full">
        {pending ? "Redirecting…" : "Upgrade — $20/mo"}
      </Button>
      {error && <p className="mt-2 text-sm text-negative">{error}</p>}
    </div>
  );
}
