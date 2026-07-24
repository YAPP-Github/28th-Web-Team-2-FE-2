import Link from "next/link";
import IconCameraFill from "@karrotmarket/react-monochrome-icon/IconCameraFill";
import { PhoneFrame, Scroll, StatusBar } from "./_lib/shell";
import { HomeVegetables } from "./_components/home-vegetables";
import { LocationLabel } from "./_components/location-label";

// F01 홈 — 위치(GPS)·검색·인기 야채. RSC 기본; 위치·검색만 클라 leaf.
export default function HomePage() {
  return (
    <PhoneFrame>
      <StatusBar />
      <Scroll className="pb-28">
        <div className="flex flex-col gap-5 px-4 pt-1">
          <LocationLabel />
          <HomeVegetables />
        </div>
      </Scroll>

      {/* 촬영 진입 — 툴팁 + 중앙 하단 FAB (Figma F01) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-2">
        <p className="rounded-full bg-bg-neutral-inverted px-4 py-2 text-body-14-medium text-fg-neutral-inverted shadow-md">
          궁금한 야채를 찍어서 검색해 보세요
        </p>
        <Link
          href="/prototype/capture"
          aria-label="야채 촬영하기"
          className="pointer-events-auto flex size-16 items-center justify-center rounded-full bg-bg-brand-solid text-fg-brand-contrast shadow-lg [&_svg]:size-7"
        >
          <IconCameraFill />
        </Link>
      </div>
    </PhoneFrame>
  );
}
