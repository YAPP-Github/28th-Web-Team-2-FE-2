import { Button } from "@web2/design-system";
import { notFound } from "next/navigation";

// 내부 검증용 갤러리 — 프로덕션 번들에 노출 금지 (conventions: playground 프로덕션 제외)
export default function PlaygroundPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="text-xl font-bold md:text-2xl">Playground</h1>
      <p className="mt-1 text-sm text-muted">
        디자인 시스템 컴포넌트를 variant × 상태별로 나열해 Figma와 대조하는
        갤러리. 새 공통 컴포넌트를 만들면 여기에 스토리를 추가한다(필수).
      </p>

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
