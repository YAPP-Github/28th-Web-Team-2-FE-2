import { SurveyButton } from "@web2/design-system";
import type { Story } from "./types";

function SurveyButtonStory() {
  return (
    <div className="flex w-full flex-col gap-4" style={{ maxWidth: 350 }}>
      <div>
        <p className="mb-1 text-sm text-gray-400">default</p>
        <SurveyButton />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-400">activated</p>
        <SurveyButton status="activated">
          숙소랑 일정부터 짜오면 그때 생각해볼게
        </SurveyButton>
      </div>
    </div>
  );
}

export const surveyButtonStory: Story = {
  id: "survey-button",
  title: "Survey Button",
  group: "컴포넌트",
  figma: "https://www.figma.com/design/TRXXVUvIwh8vh7FbBusXCO/Looky-Design?node-id=395-9851&m=dev",
  description: "설문 선택지의 default와 activated 상태.",
  Component: SurveyButtonStory,
};
