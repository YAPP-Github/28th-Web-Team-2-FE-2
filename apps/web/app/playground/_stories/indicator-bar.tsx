import { IndicatorBar } from "@web2/design-system";
import type { Story } from "./types";

function IndicatorBarStory() {
  return (
    <div className="flex flex-col gap-5 bg-gray-400 p-4">
      {([1, 2, 3] as const).map((step) => (
        <div key={step}>
          <p className="mb-1 text-sm text-white">step{step}</p>
          <IndicatorBar step={step} />
        </div>
      ))}
    </div>
  );
}

export const indicatorBarStory: Story = {
  id: "indicator-bar",
  title: "Indicator Bar",
  group: "컴포넌트",
  figma: "https://www.figma.com/design/TRXXVUvIwh8vh7FbBusXCO/Looky-Design?node-id=754-4137&m=dev",
  description: "3단계 진행 위치를 나타내는 장식용 인디케이터.",
  Component: IndicatorBarStory,
};
