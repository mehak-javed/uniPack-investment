import Link from "next/link";
import { Bell } from "lucide-react";
import { MainNav } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";
import { SearchBar } from "./search-bar";
import { Button } from "./ui/button";
import { getSessionUser } from "@/lib/account";
import { signOut } from "@/app/login/actions";

function Logo() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary">
      <span className="block h-3.5 w-3.5 rotate-45 rounded-[3px] bg-primary-foreground" />
    </span>
  );
}

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">
            uni<span className="text-primary">PACK</span>
          </span>
        </Link>

        <div className="hidden lg:block">
          <MainNav />
        </div>

        <SearchBar className="ml-auto w-40 sm:w-56 md:w-72" />

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Notifications"
            className="relative hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          <ThemeToggle />
          {user ? (
            <form action={signOut} className="flex items-center gap-2">
              <span className="hidden max-w-[140px] truncate text-sm text-muted-foreground md:inline">
                {user.email}
              </span>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
