import { TextFieldSet } from "@web2/design-system";
import type { Story } from "./types";

function TextFieldSetStory() {
  return (
    <div className="flex w-full flex-col gap-4" style={{ maxWidth: 350 }}>
      <div>
        <p className="mb-1 text-sm text-gray-400">default</p>
        <TextFieldSet />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-400">description</p>
        <TextFieldSet variant="description" />
      </div>
    </div>
  );
}

export const textFieldSetStory: Story = {
  id: "text-field-set",
  title: "Text Field Set",
  group: "컴포넌트",
  figma: "https://www.figma.com/design/TRXXVUvIwh8vh7FbBusXCO/Looky-Design?node-id=395-9850&m=dev",
  description: "오류 필드와 설명 문구 조합.",
  Component: TextFieldSetStory,
};
