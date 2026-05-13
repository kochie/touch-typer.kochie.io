import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DownloadMenu } from "./DownloadMenu";
import { MobileSheet } from "./MobileSheet";
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
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="Touch Typer home">
            <Image
              src="/logo-ink.svg"
              alt="Touch Typer"
              width={730}
              height={284}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-ink/80 hover:text-ink transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button href={signedIn ? "/account" : "/signin"} variant="ghost" size="md">
              {signedIn ? "Account" : "Sign in"}
            </Button>
            <DownloadMenu />
          </div>

          <MobileSheet signedIn={signedIn} />
        </div>
      </Container>
    </header>
  );
}
