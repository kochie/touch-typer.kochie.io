"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-solid-svg-icons";

const STORAGE_KEY = "pastdue-banner-dismissed";

export function DismissButton() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
  }, []);

  useEffect(() => {
    if (!dismissed) return;
    const banner = document.querySelector("[data-pastdue-banner]");
    if (banner) (banner as HTMLElement).style.display = "none";
  }, [dismissed]);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  return (
    <button
      onClick={dismiss}
      aria-label="Dismiss banner"
      className="rounded p-1 text-paper/80 hover:text-paper hover:bg-paper/10 transition-colors"
    >
      <FontAwesomeIcon icon={faXmark} className="size-4" />
    </button>
  );
}
