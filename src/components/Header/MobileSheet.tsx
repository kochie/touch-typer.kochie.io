"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/pro-solid-svg-icons";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface MobileSheetProps {
  signedIn: boolean;
}

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const downloadLinks = [
  { href: "https://apps.apple.com/au/app/touch-typer/id1637786724", label: "Mac App Store" },
  { href: "https://www.microsoft.com/store/apps/9NG3CCFL631D", label: "Microsoft Store" },
  { href: "https://snapcraft.io/touch-typer", label: "Snap Store (Linux)" },
];

export function MobileSheet({ signedIn }: MobileSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="p-2 text-ink md:hidden"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50 md:hidden">
        <div className="fixed inset-0 bg-ink/40" aria-hidden="true" />
        <div className="fixed inset-0 flex">
          <DialogPanel className="ml-auto h-full w-full max-w-sm bg-paper p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Image
                src="/logo-ink.svg"
                alt="Touch Typer"
                width={730}
                height={284}
                className="h-7 w-auto"
              />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-base hover:bg-paper-soft"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-line pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute mb-2">
                Download
              </p>
              <div className="flex flex-col gap-1">
                {downloadLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg px-3 py-2 text-sm hover:bg-paper-soft"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <Button href={signedIn ? "/account" : "/signin"} variant="secondary" size="md">
                {signedIn ? "Account" : "Sign in"}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
