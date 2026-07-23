// UT 프로토타입 공용 프레젠테이션 요소 (훅 없음). SEED 시맨틱 색·타이포 토큰 사용.

import type { ReactNode } from "react";
import IconLaptopFill from "@karrotmarket/react-monochrome-icon/IconLaptopFill";
import IconHouseFill from "@karrotmarket/react-monochrome-icon/IconHouseFill";
import IconGraduationcapFill from "@karrotmarket/react-monochrome-icon/IconGraduationcapFill";
import IconHeartFill from "@karrotmarket/react-monochrome-icon/IconHeartFill";
import IconMegaphoneFill from "@karrotmarket/react-monochrome-icon/IconMegaphoneFill";
import type { ApplyStatus, PolicyTheme, VerdictKind } from "@/lib/youth-policy/types";

// 카테고리 → SEED 모노크롬 아이콘 (칩·상세에서 공통 사용).
export const THEME_ICON: Record<PolicyTheme, ReactNode> = {
  일자리: <IconLaptopFill />,
  주거: <IconHouseFill />,
  교육: <IconGraduationcapFill />,
  복지문화: <IconHeartFill />,
  참여권리: <IconMegaphoneFill />,
};

export const VERDICT_STYLE: Record<
  VerdictKind,
  { label: string; badge: string; panel: string; summary: string }
> = {
  해당: {
    label: "받을 수 있어요",
    badge: "bg-bg-positive-weak text-fg-positive",
    panel: "bg-bg-positive-weak",
    summary: "입력한 조건으로는 대상에 해당해요.",
  },
  조건부: {
    label: "조건 확인 필요",
    badge: "bg-bg-warning-weak text-fg-warning",
    panel: "bg-bg-warning-weak",
    summary: "자동으로 확정할 수 없는 조건이 있어요. 근거를 보고 직접 판단하세요.",
  },
  비해당: {
    label: "대상이 아니에요",
    badge: "bg-bg-neutral-weak text-fg-neutral-subtle",
    panel: "bg-bg-neutral-weak",
    summary: "입력한 조건으로는 대상에서 벗어나요.",
  },
};

export function VerdictBadge({ verdict }: { verdict: VerdictKind }) {
  const s = VERDICT_STYLE[verdict];
  return (
    <span
      className={`t2-bold inline-flex shrink-0 items-center rounded-full px-2.5 py-1 ${s.badge}`}
    >
      {s.label}
    </span>
  );
}

// 신청 상태 배지 — 마감/예정은 약하게(회색), 모집중·상시는 눈에 띄게.
const APPLY_STATUS_STYLE: Record<ApplyStatus, string> = {
  모집중: "bg-bg-positive-weak text-fg-positive",
  상시: "bg-bg-informative-weak text-fg-informative",
  예정: "bg-bg-warning-weak text-fg-warning",
  마감: "bg-bg-neutral-weak text-fg-neutral-muted",
};

export function ApplyStatusBadge({ status }: { status: ApplyStatus }) {
  return (
    <span
      className={`t1-medium inline-flex shrink-0 items-center rounded-full px-2 py-0.5 ${APPLY_STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

interface ShellProps {
  title: ReactNode;
  description?: ReactNode;
  /** 1부터 시작하는 현재 스텝. 없으면 진행바 숨김. */
  step?: number;
  totalSteps?: number;
  children: ReactNode;
  /** 하단 고정 영역(주로 다음 버튼). */
  footer?: ReactNode;
}

export function Shell({
  title,
  description,
  step,
  totalSteps,
  children,
  footer,
}: ShellProps) {
  // 프레임 = iPhone 12 Pro 논리 해상도 390 × 844pt (UT 기준 기기).
  return (
    <div className="flex min-h-screen justify-center bg-bg-neutral-weak md:items-center md:py-8">
      <main
        className="flex w-full flex-col overflow-hidden bg-bg-layer-default md:rounded-3xl md:shadow-xl"
        style={{ maxWidth: 390, height: 844 }}
      >
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-28">
          {step !== undefined && totalSteps !== undefined && (
            <>
              {/* 시각 진행바는 장식(aria-hidden), 스크린리더에는 텍스트로 단계 안내 */}
              <p className="sr-only">
                {totalSteps}단계 중 {step}단계
              </p>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i < step ? "bg-bg-neutral-solid" : "bg-bg-neutral-weak"}`}
                  />
                ))}
              </div>
            </>
          )}
          <header className="flex flex-col gap-2">
            <h1 className="t8-bold text-fg-neutral">{title}</h1>
            {description && (
              <p className="t4-regular text-fg-neutral-subtle">{description}</p>
            )}
          </header>
          {children}
        </div>
        {footer && (
          <div className="border-t border-stroke-neutral-weak bg-bg-layer-default px-5 py-4">
            {footer}
          </div>
        )}
      </main>
    </div>
  );
}
