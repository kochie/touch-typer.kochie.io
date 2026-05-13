import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DownloadMenu } from "./DownloadMenu";
import { MobileSheet } from "./MobileSheet";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderLogo } from "./HeaderLogo";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default async function Header() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const signedIn = !!user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="Touch Typer home">
            <HeaderLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-fg/80 hover:text-fg transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button href={signedIn ? "/account" : "/signin"} variant="ghost" size="md">
              {signedIn ? "Account" : "Sign in"}
            </Button>
            <DownloadMenu />
          </div>

          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <MobileSheet signedIn={signedIn} />
          </div>
        </div>
      </Container>
    </header>
  );
}
