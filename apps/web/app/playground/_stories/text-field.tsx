import { TextField } from "@web2/design-system";
import type { Story } from "./types";

function TextFieldStory() {
  return (
    <div className="flex w-full flex-col gap-4" style={{ maxWidth: 350 }}>
      {(["focused", "entered", "placeholder", "error"] as const).map(
        (status) => (
          <div key={status}>
            <p className="mb-1 text-sm text-gray-400">{status}</p>
            <TextField status={status} />
          </div>
        ),
      )}
    </div>
  );
}

export const textFieldStory: Story = {
  id: "text-field",
  title: "Text Field",
  group: "컴포넌트",
  figma: "https://www.figma.com/design/TRXXVUvIwh8vh7FbBusXCO/Looky-Design?node-id=395-9845&m=dev",
  description: "입력 동작 없이 상태만 표현하는 시각 전용 필드.",
  Component: TextFieldStory,
};
