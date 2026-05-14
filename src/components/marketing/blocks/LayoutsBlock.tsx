import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";

export function LayoutsBlock() {
  return (
    <BigFeatureBlock
      anchor="layouts"
      eyebrow="Keyboard layouts"
      title="QWERTY, Dvorak, Colemak — switch in one click."
      body="Practice on the layout you use, or learn a new one. Drills adapt to layout. Switch back any time."
      linkHref="/features#layouts"
      linkLabel="Learn more"
      imageSrc="/screenshots/layouts.png"
      imageAlt="Touch Typer layout picker — Dvorak selected"
      imagePosition="left"
      tone="paper-soft"
    />
  );
}
