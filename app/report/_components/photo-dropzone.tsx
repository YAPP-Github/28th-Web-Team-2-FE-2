import type { ReactNode } from "react";
import { cn } from "@/app/_lib/cn";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// Figma `report-form-photo-dropzone` — 화면GUI(원본) 364:8152, sync 2026-08-13.
//
// get_design_context 실측:
//   루트   bg surface/secondary · radius/**md**(8) · flex flex-col gap-[12px] items-start
//          justify-center · px-[12px] py-[16px] · w-full
//          → 높이 hug: 16 + 44(hint) + 12 + 38(버튼) + 16 = **126px** (XML 실측과 일치)
//   hint   flex gap-[8px] items-start · w-[235px]
//     아이콘  24×24 (별 2개 sparkle)
//     문구    사진을 서버로 보내지 않는 현재 동작에 맞춰 로컬 미리보기 안내로 바꿨다.
//   버튼   px-[20px] py-[8px] gap-[4px] radius/md · body/14-semibold → 우리 `Button size="small"`과
//          패딩·radius·타이포가 **정확히 일치**한다. 그래서 새로 만들지 않고 슬롯으로 받는다.
//
// sparkle 아이콘은 `public/figma/design-library/icons/sparkle.svg`를 사용한다.
//
// ⚠️ 문구 안 강조색이 raw hex다 — `#05a163`. `content/brand/light`와 같아서 토큰으로 옮겼다.
//
// 대비: content/secondary 4.79:1 · content/brand/light 3.95:1(14px 기준 4.5:1 **미달**).
//       미달분은 Figma 원본 값이라 그대로 두고 기록만 한다.
//       ※ 이 미달값은 `surface/secondary`(#f2f3f8) 배경 기준으로 다시 재면 더 낮아진다.

export interface PhotoDropzoneProps {
  /**
   * 24×24 sparkle 아이콘.
   */
  icon?: ReactNode;
  /** 사진을 고르는 버튼. `<Button size="small" className="w-full">` 형태를 기대한다. */
  action: ReactNode;
  className?: string;
}

export function PhotoDropzone({ icon, action, className }: PhotoDropzoneProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-start justify-center gap-3 rounded-md bg-surface-secondary px-3 py-4",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {/* 24×24 고정 — 에셋이 없어도 시안 여백이 흔들리지 않게 자리를 유지한다. */}
        <span className="block size-6 shrink-0">{icon}</span>
        <p className="text-body-14-medium text-content-secondary">
          <span className="text-body-14-semibold text-content-brand-light">야채, 영수증 사진</span>
          을 추가하면
          <br />
          기기 안에서 바로 미리볼 수 있어요
        </p>
      </div>
      {action}
    </div>
  );
}
