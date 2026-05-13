import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signin", label: "Sign in" },
      { href: "/signup", label: "Sign up" },
      { href: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "mailto:hello@kochie.io", label: "Contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-ink-soft text-paper">
      <Container width="wide">
        <div className="py-16 grid gap-10 grid-cols-2 sm:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo-white.svg"
              alt="Touch Typer"
              width={2501}
              height={1054}
              className="h-8 w-auto"
            />
            <p className="mt-3 text-sm text-paper/70 max-w-xs">
              The desktop typing tutor that turns deliberate practice into real progress.
            </p>
            <a
              href="https://github.com/kochie/touch-type"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="mt-4 inline-flex items-center gap-2 text-paper/70 hover:text-paper transition-colors"
            >
              <FontAwesomeIcon icon={faGithub} />
              <span className="text-sm">Open source on GitHub</span>
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/60 mb-3">
                {col.title}
              </p>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-paper/80 hover:text-paper transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-paper/10 py-6 text-xs text-paper/50 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Touch Typer</span>
          <span>
            Made by{" "}
            <a href="https://kochie.io" className="hover:text-paper">
              kochie
            </a>
          </span>
        </div>
      </Container>
    </footer>
  );
}
