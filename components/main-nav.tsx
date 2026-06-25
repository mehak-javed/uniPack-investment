"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Markets", href: "/markets" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "News", href: "/news" },
  { label: "Pricing", href: "/pricing" },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 md:flex">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
