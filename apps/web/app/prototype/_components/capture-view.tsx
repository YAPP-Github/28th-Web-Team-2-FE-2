"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import IconXmarkLine from "@karrotmarket/react-monochrome-icon/IconXmarkLine";
import IconCameraFill from "@karrotmarket/react-monochrome-icon/IconCameraFill";
import { PhoneFrame, StatusBar } from "../_lib/shell";

// F02 야채 촬영 — 프로토타입이라 실제 카메라 대신 샘플 사진 목업. 셔터 → 제보 폼(촬영 경로).
export function CaptureView({ item }: { item: string }) {
  const router = useRouter();
  const closeHref = item ? `/prototype/price/${item}` : "/prototype";
  const query = new URLSearchParams({ method: "photo", ...(item ? { item } : {}) });

  return (
    <PhoneFrame>
      <div className="absolute inset-0 bg-neutral-900">
        {/* 촬영 미리보기(샘플) */}
        <Image
          src="/ui/capture-sample.jpg"
          alt="촬영 미리보기"
          fill
          sizes="390px"
          priority
          className="object-cover"
        />

        <div className="relative z-10 flex h-full flex-col text-white">
          {/* 상단 바 */}
          <div className="shrink-0 bg-neutral-900/95">
            <StatusBar dark />
            <div className="relative flex h-14 items-center justify-center">
              <Link
                href={closeHref}
                aria-label="촬영 닫기"
                className="absolute left-2 flex size-12 items-center justify-center rounded-full hover:bg-white/10 [&_svg]:size-6"
              >
                <IconXmarkLine />
              </Link>
              <h1 className="text-head2-18">야채 촬영</h1>
            </div>
          </div>

          <div className="flex-1" />

          {/* 안내 + 셔터 (사진 위, 가독성 위해 하단 그라디언트) */}
          <div className="shrink-0 bg-gradient-to-t from-black/60 to-transparent pt-10 pb-10">
            <div className="flex flex-col items-center gap-5">
              <button
                type="button"
                aria-label="촬영"
                onClick={() => router.push(`/prototype/report?${query.toString()}`)}
                className="flex size-[74px] items-center justify-center rounded-full bg-bg-brand-solid text-fg-brand-contrast shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white [&_svg]:size-8"
              >
                <IconCameraFill />
              </button>
              <p className="text-body-14-regular text-white/90">가격과 야채가 잘 보이게 촬영해 주세요</p>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
