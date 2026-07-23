// UT 프로토타입 공용 프레젠테이션 요소 (훅 없음).
// 색은 표준 Tailwind 팔레트 사용 — 이 라우트는 UT 실험용이라 Figma 토큰 화이트리스트 밖.

import type { ReactNode } from "react";
import type { VerdictKind } from "@/lib/youth-policy/types";

export const VERDICT_STYLE: Record<
  VerdictKind,
  { label: string; badge: string; summary: string }
> = {
  해당: {
    label: "받을 수 있어요",
    badge: "bg-green-100 text-green-800",
    summary: "입력한 조건으로는 대상에 해당해요.",
  },
  조건부: {
    label: "조건 확인 필요",
    badge: "bg-amber-100 text-amber-800",
    summary: "자동으로 확정할 수 없는 조건이 있어요. 근거를 보고 직접 판단하세요.",
  },
  비해당: {
    label: "대상이 아니에요",
    badge: "bg-gray-200 text-gray-800",
    summary: "입력한 조건으로는 대상에서 벗어나요.",
  },
};

export function VerdictBadge({ verdict }: { verdict: VerdictKind }) {
  const s = VERDICT_STYLE[verdict];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}
    >
      {s.label}
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
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white">
      <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-28">
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
                  className={`h-1 flex-1 rounded-full ${i < step ? "bg-gray-900" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </>
        )}
        <header className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </header>
        {children}
      </div>
      {footer && (
        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-4">
          {footer}
        </div>
      )}
    </main>
  );
}
