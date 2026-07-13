import { notFound } from "next/navigation";
import { stories } from "./_stories/registry";
import type { StoryGroup } from "./_stories/types";

// 디자인 시스템 검증 갤러리 — 런칭 전까지 배포에서도 공개(팀 검증용 Vercel).
// 실사용자 릴리즈 시 Vercel env에 PLAYGROUND_DISABLED=1 설정으로 숨긴다 (conventions 참조)
// 배경은 디자이너 대조 기준인 흰색으로 고정 — 다크모드·전역 테마의 영향을 받지 않는다

const GROUP_ORDER: StoryGroup[] = ["파운데이션", "컴포넌트", "패턴"];

export default function PlaygroundPage() {
  if (process.env.PLAYGROUND_DISABLED === "1") {
    notFound();
  }

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: stories.filter((s) => s.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto flex max-w-5xl flex-col md:flex-row">
        {/* 좌측 목차 — 모바일에선 상단 가로 스크롤 */}
        <nav
          aria-label="스토리 목차"
          className="shrink-0 border-b border-neutral-200 bg-white px-4 py-3 md:sticky md:top-0 md:h-screen md:w-56 md:overflow-y-auto md:border-r md:border-b-0 md:px-5 md:py-8"
        >
          <p className="text-sm font-bold">Looky Playground</p>
          <p className="mt-1 hidden text-xs leading-relaxed text-neutral-400 md:block">
            규격 1개 = 스토리 1개.
            <br />
            Figma에 있는 것만 등록.
          </p>
          <div className="mt-4 flex gap-4 overflow-x-auto md:flex-col md:gap-5">
            {grouped.map(({ group, items }) => (
              <div key={group} className="shrink-0">
                <p className="px-2 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
                  {group}
                </p>
                <ul className="mt-1 flex gap-1 md:flex-col">
                  {items.map((s) => (
                    <li key={s.id} className="shrink-0">
                      <a
                        href={`#${s.id}`}
                        className="block rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {grouped.map(({ group, items }) => (
            <section key={group} aria-label={group} className="mb-14">
              <h2 className="text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
                {group}
              </h2>
              {items.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  aria-labelledby={`${s.id}-title`}
                  className="mt-4 mb-10 scroll-mt-4 rounded-xl border border-neutral-200"
                >
                  <div className="border-b border-neutral-100 px-5 py-4">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3
                        id={`${s.id}-title`}
                        className="text-lg font-semibold"
                      >
                        {s.title}
                      </h3>
                      {s.figma.startsWith("https://") ? (
                        <a
                          href={s.figma}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${s.title} Figma 원본`}
                          className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-500 hover:text-neutral-900"
                        >
                          Figma 원본
                        </a>
                      ) : (
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-500">
                          Figma {s.figma}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {s.description}
                    </p>
                  </div>
                  <div className="px-5 py-6">
                    <s.Component />
                  </div>
                </section>
              ))}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
