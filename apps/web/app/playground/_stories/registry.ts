import { ctaStory } from "./cta";
import { ctaInstaStory } from "./cta-insta";
import { ctaSmallStory } from "./cta-small";
import { indicatorBarStory } from "./indicator-bar";
import { surveyButtonStory } from "./survey-button";
import { textFieldStory } from "./text-field";
import { textFieldSetStory } from "./text-field-set";
import type { Story } from "./types";
import { typographyStory } from "./typography";

// 스토리 등록부 — 규격(컴포넌트·토큰) 하나 = _stories/ 파일 하나 = 여기 한 줄.
// 디자이너가 새 규격을 작업하면 파일을 추가하고 여기 등록한다 (design-guide.md 플레이그라운드 규약)
export const stories: Story[] = [
  typographyStory,
  ctaStory,
  ctaSmallStory,
  ctaInstaStory,
  textFieldStory,
  textFieldSetStory,
  surveyButtonStory,
  indicatorBarStory,
];
