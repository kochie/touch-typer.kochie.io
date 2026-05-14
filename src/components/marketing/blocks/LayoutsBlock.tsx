import { BigFeatureBlock } from "@/components/marketing/BigFeatureBlock";
import { LayoutsWireframe } from "@/components/marketing/wireframes/LayoutsWireframe";

export function LayoutsBlock() {
  return (
    <BigFeatureBlock
      anchor="layouts"
      eyebrow="Keyboard layouts"
      title="QWERTY, Dvorak, Colemak — switch in one click."
      body="Practice on the layout you use, or learn a new one. Drills adapt to layout. Switch back any time."
      linkHref="/features#layouts"
      linkLabel="Learn more"
      mockup={<LayoutsWireframe />}
      imagePosition="left"
      tone="paper-soft"
    />
  );
}
