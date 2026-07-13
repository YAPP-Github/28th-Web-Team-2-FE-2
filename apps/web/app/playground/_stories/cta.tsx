import { Cta } from "@web2/design-system";
import type { Story } from "./types";

function CtaStory() {
  return (
    <div className="flex w-full flex-col gap-4" style={{ maxWidth: 350 }}>
      <div>
        <p className="mb-1 text-sm text-gray-400">default</p>
        <Cta>확인</Cta>
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-400">disabled</p>
        <Cta status="disabled">확인</Cta>
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-400">pressed</p>
        <Cta status="pressed">확인</Cta>
      </div>
    </div>
  );
}

export const ctaStory: Story = {
  id: "cta",
  title: "CTA",
  group: "컴포넌트",
  figma: "https://www.figma.com/design/TRXXVUvIwh8vh7FbBusXCO/Looky-Design?node-id=395-9840&m=dev",
  description: "주요 행동 버튼의 default, disabled, pressed 상태.",
  Component: CtaStory,
};
