import type { DOMAttributes, HTMLAttributes } from "react";

interface MsStoreBadgeAttributes {
  size?: string;
  productid?: string;
  "window-mode"?: string;
  theme?: string;
  language?: string;
  animation?: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ms-store-badge": HTMLAttributes<HTMLElement> &
        DOMAttributes<HTMLElement> &
        MsStoreBadgeAttributes;
    }
  }
}
