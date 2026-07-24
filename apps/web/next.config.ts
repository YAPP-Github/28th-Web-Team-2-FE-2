import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@web2/design-system"],
  images: {
    // 야채·카트 자산이 SVG(Figma export) — next/image가 SVG를 서빙하려면 필요.
    // 보안 하드닝: 스크립트 실행 차단(script-src 'none')·sandbox·다운로드 처리로
    // SVG 내장 스크립트 위협을 무력화한다(자산은 우리 소유이나 방어적으로).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  turbopack: {
    // 모노레포 루트 고정 — 홈 디렉토리의 무관한 lockfile 오인식 방지
    root: path.join(import.meta.dirname, "../.."),
  },
};

export default nextConfig;
