import { Button } from "@web2/design-system";
import { notFound } from "next/navigation";

// 내부 검증용 갤러리 — 런칭 전까지 배포에서도 공개(팀 검증용 Vercel).
// 실사용자 릴리즈 시 Vercel env에 PLAYGROUND_DISABLED=1 설정으로 숨긴다 (conventions 참조)
export default function PlaygroundPage() {
  if (process.env.PLAYGROUND_DISABLED === "1") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="text-xl font-bold md:text-2xl">Playground</h1>
      <p className="mt-1 text-sm text-muted">
        디자인 시스템 컴포넌트를 variant × 상태별로 나열해 Figma와 대조하는
        갤러리. 새 공통 컴포넌트를 만들면 여기에 스토리를 추가한다(필수).
      </p>

      <section className="mt-8" aria-labelledby="type-story">
        <h2 id="type-story" className="text-lg font-semibold">
          Typography
        </h2>
        <p className="mt-1 text-sm text-muted">
          Figma node 369-4075 sync. head 2종은 커스텀 폰트 파일 확보 전이라
          Pretendard로 fallback 렌더된다(자간·크기·굵기는 확정).
        </p>
        <div className="mt-4 flex flex-col gap-5">
          <div>
            <p className="text-xs text-muted">head1 · Y SpotlightOTF (fallback)</p>
            <p className="font-head1 text-head1-26">head1-26 · 다시 봄 Looky</p>
            <p className="font-head1 text-head1-20">head1-20 · 다시 봄 Looky</p>
            <p className="font-head1 text-head1-16">head1-16 · 다시 봄 Looky</p>
          </div>
          <div>
            <p className="text-xs text-muted">head2 · YPairingFont OTF Bold (fallback)</p>
            <p className="font-head2 text-head2-26">head2-26 · 다시 봄 Looky</p>
            <p className="font-head2 text-head2-20">head2-20 · 다시 봄 Looky</p>
            <p className="font-head2 text-head2-14">head2-14 · 다시 봄 Looky</p>
          </div>
          <div>
            <p className="text-xs text-muted">body · Pretendard</p>
            <p className="font-body text-body-18-semibold">body-18-semibold · 가나다 ABC 123</p>
            <p className="font-body text-body-16-regular">body-16-regular · 가나다 ABC 123</p>
            <p className="font-body text-body-14-regular">body-14-regular · 가나다 ABC 123</p>
          </div>
          <div>
            <p className="text-xs text-muted">caption · Pretendard</p>
            <p className="font-body text-caption-12-medium">caption-12-medium · 가나다 ABC 123</p>
            <p className="font-body text-caption-12-regular">caption-12-regular · 가나다 ABC 123</p>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="button-story">
        <h2 id="button-story" className="text-lg font-semibold">
          Button
        </h2>
        {/* TODO(✍️): Figma 스크린샷을 옆에 나란히 배치 (figma-implementer로 추출) */}
        <div className="mt-4 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large (모바일 full)</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
