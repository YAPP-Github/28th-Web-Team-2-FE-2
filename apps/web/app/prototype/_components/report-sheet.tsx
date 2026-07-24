"use client";

import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
  BottomSheetTrigger,
} from "seed-design/ui/bottom-sheet";

// 제보하기 CTA → 바텀시트(촬영 / 직접 입력) — Figma F03 연결선 그대로.
export function ReportSheet({ vegetableId }: { vegetableId: string }) {
  return (
    <BottomSheetRoot>
      <BottomSheetTrigger asChild>
        <ActionButton variant="neutralSolid" size="large" className="w-full">
          제보하기
        </ActionButton>
      </BottomSheetTrigger>
      <BottomSheetContent title="어떻게 제보할까요?">
        <BottomSheetBody className="flex flex-col gap-2 pb-2">
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/capture?item=${vegetableId}`}>야채 촬영하기</Link>
          </ActionButton>
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/report?item=${vegetableId}`}>직접 입력하기</Link>
          </ActionButton>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
