import { CtaInsta } from "@web2/design-system";
import type { Story } from "./types";

function CtaInstaStory() {
  return (
    <div className="w-full" style={{ maxWidth: 171 }}>
      <CtaInsta />
    </div>
  );
}

export const ctaInstaStory: Story = {
  id: "cta-insta",
  title: "CTA Insta",
  group: "컴포넌트",
  figma: "https://www.figma.com/design/TRXXVUvIwh8vh7FbBusXCO/Looky-Design?node-id=395-9844&m=dev",
  description: "인스타그램 스토리 공유 전용 CTA.",
  Component: CtaInstaStory,
};
