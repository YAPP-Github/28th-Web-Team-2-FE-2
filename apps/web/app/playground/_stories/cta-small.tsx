import { CtaSmall } from "@web2/design-system";
import type { Story } from "./types";

function CtaSmallStory() {
  return (
    <div className="flex w-full flex-col gap-4" style={{ maxWidth: 171 }}>
      <div>
        <p className="mb-1 text-sm text-gray-400">stroke</p>
        <CtaSmall variant="stroke" />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-400">stroke_icn</p>
        <CtaSmall variant="strokeIcon" />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-400">fill</p>
        <CtaSmall variant="fill" />
      </div>
    </div>
  );
}

export const ctaSmallStory: Story = {
  id: "cta-small",
  title: "CTA Small",
  group: "컴포넌트",
  figma: "https://www.figma.com/design/TRXXVUvIwh8vh7FbBusXCO/Looky-Design?node-id=414-13236&m=dev",
  description: "공유 행동에 사용하는 stroke, stroke icon, fill 버튼.",
  Component: CtaSmallStory,
};
