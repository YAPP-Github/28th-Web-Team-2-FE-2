"use client";

// 결과 페이지 (기능① 타겟 B-2) — 전체 판정 후 해당/조건부/비해당 분기.
// 카테고리는 자격이 아니라 "표시 필터"로 상단에서 좁힌다.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chip } from "seed-design/ui/chip";
import { isCompleteProfile, THEME_OPTIONS } from "@/lib/youth-policy/profile";
import { getAllPolicies } from "@/lib/youth-policy/source";
import { recommendPolicies, type RankedPolicy } from "@/lib/youth-policy/judge";
import type { PolicyTheme } from "@/lib/youth-policy/types";
import { usePrototypeSession } from "../_lib/session";
import { Shell, THEME_ICON, VerdictBadge } from "../_lib/ui";

function PolicyCard({ ranked }: { ranked: RankedPolicy }) {
  const { policy, verdict } = ranked;
  const topConditional = verdict.reasons.find((r) => r.result === "조건부");
  return (
    <Link
      href={`/prototype/policy/${policy.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-stroke-neutral-weak bg-bg-layer-default p-4 active:bg-bg-layer-default-pressed"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="t2-medium text-fg-neutral-subtle">{policy.theme}</span>
        <VerdictBadge verdict={verdict.verdict} />
      </div>
      <h3 className="t5-bold text-fg-neutral">{policy.name}</h3>
      <p className="t4-regular line-clamp-2 text-fg-neutral-subtle">{policy.summary}</p>
      {verdict.verdict === "조건부" && topConditional && (
        <p className="t3-regular mt-1 rounded-lg bg-bg-warning-weak px-3 py-2 text-fg-warning">
          확인 필요: {topConditional.detail}
        </p>
      )}
    </Link>
  );
}

function Section({
  title,
  hint,
  items,
}: {
  title: string;
  hint?: string;
  items: RankedPolicy[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="t5-bold text-fg-neutral">
          {title} <span className="text-fg-neutral-muted">{items.length}</span>
        </h2>
        {hint && <p className="t3-regular text-fg-neutral-subtle">{hint}</p>}
      </div>
      <div className="flex flex-col gap-3">
        {items.map((r) => (
          <PolicyCard key={r.policy.id} ranked={r} />
        ))}
      </div>
    </section>
  );
}

export default function RecommendPage() {
  const router = useRouter();
  const { data, loaded } = usePrototypeSession();
  const [cats, setCats] = useState<PolicyTheme[]>([]);

  const rec = useMemo(
    () => (isCompleteProfile(data) ? recommendPolicies(getAllPolicies(), data) : null),
    [data],
  );

  useEffect(() => {
    if (loaded && !isCompleteProfile(data)) router.replace("/prototype");
  }, [loaded, data, router]);

  if (!loaded || !rec || !isCompleteProfile(data)) {
    return <Shell title="추천을 준비하고 있어요" description="잠시만요…">{null}</Shell>;
  }

  const inCat = (r: RankedPolicy) =>
    cats.length === 0 || cats.includes(r.policy.theme);
  const matched = rec.matched.filter(inCat);
  const conditional = rec.conditional.filter(inCat);
  const excluded = rec.excluded.filter(inCat);
  const totalShown = matched.length + conditional.length;

  const toggleCat = (theme: PolicyTheme, checked: boolean) =>
    setCats((prev) => (checked ? [...prev, theme] : prev.filter((t) => t !== theme)));

  return (
    <Shell
      title={`${data.nickname}님을 위한 정책`}
      description="입력한 조건으로 판정한 결과예요. 카드를 눌러 판정 근거를 확인하세요."
    >
      <div className="flex flex-col gap-8">
        {/* 카테고리 = 표시 필터 (자격 아님) */}
        <section className="flex flex-col gap-3">
          <h2 className="t4-bold text-fg-neutral">분야로 좁히기</h2>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map((theme) => (
              <Chip.Toggle
                key={theme}
                size="medium"
                checked={cats.includes(theme)}
                onCheckedChange={(checked) => toggleCat(theme, checked)}
              >
                <Chip.PrefixIcon>{THEME_ICON[theme]}</Chip.PrefixIcon>
                <Chip.Label>{theme}</Chip.Label>
              </Chip.Toggle>
            ))}
          </div>
        </section>

        {totalShown === 0 ? (
          <p className="t4-regular text-fg-neutral-subtle">
            {cats.length > 0
              ? "고른 분야에서는 해당·조건부 정책이 없어요. 필터를 풀어보세요."
              : "바로 해당되는 정책을 찾지 못했어요."}
            {excluded.length > 0 && " 아래 대상 아님 목록도 확인해보세요."}
          </p>
        ) : (
          <>
            <Section
              title="받을 수 있어요"
              hint="입력한 조건으로 대상에 해당하는 정책"
              items={matched}
            />
            <Section
              title="조건만 맞으면 돼요"
              hint="자동으로 확정 못 한 조건이 있어요 — 근거를 보고 직접 판단하세요"
              items={conditional}
            />
          </>
        )}

        {excluded.length > 0 && (
          <details className="rounded-2xl bg-bg-layer-fill p-4">
            <summary className="t4-medium cursor-pointer text-fg-neutral-subtle">
              대상이 아닌 정책 {excluded.length}개 보기
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {excluded.map((r) => (
                <PolicyCard key={r.policy.id} ranked={r} />
              ))}
            </div>
          </details>
        )}

        <Link
          href="/prototype/profile"
          className="t4-medium text-center text-fg-neutral-subtle underline"
        >
          입력 정보 다시 고치기
        </Link>
      </div>
    </Shell>
  );
}
