"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { faApple, faWindows, faLinux } from "@fortawesome/free-brands-svg-icons";
import { Button } from "@/components/ui/Button";

const items = [
  { href: "https://apps.apple.com/au/app/touch-typer/id1637786724", label: "Mac App Store", icon: faApple },
  { href: "https://www.microsoft.com/store/apps/9NG3CCFL631D", label: "Microsoft Store", icon: faWindows },
  { href: "https://snapcraft.io/touch-typer", label: "Snap Store (Linux)", icon: faLinux },
];

export function DownloadMenu() {
  return (
    <Menu as="div" className="relative">
      <MenuButton as={Button} variant="primary" size="md">
        Download <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        className="mt-2 w-56 rounded-lg border border-border bg-bg p-1 shadow-lg focus:outline-none"
      >
        {items.map((item) => (
          <MenuItem key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-bg-elevated data-[focus]:bg-bg-elevated"
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              {item.label}
            </a>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
