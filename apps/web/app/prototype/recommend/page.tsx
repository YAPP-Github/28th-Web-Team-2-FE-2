"use client";

// [4/4] 맞춤 추천 (기능① 타겟 B-2) — 관심 테마로 거른 뒤 판정해서 해당/조건부/비해당으로 분기.
// 온통청년식 평면 나열이 아니라 "노이즈를 걸러 보여주는" 것이 핵심.
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isCompleteProfile } from "@/lib/youth-policy/profile";
import { getAllPolicies } from "@/lib/youth-policy/source";
import { recommendPolicies, type RankedPolicy } from "@/lib/youth-policy/judge";
import { usePrototypeSession } from "../_lib/session";
import { Shell, VerdictBadge } from "../_lib/ui";

function PolicyCard({ ranked }: { ranked: RankedPolicy }) {
  const { policy, verdict } = ranked;
  const topConditional = verdict.reasons.find((r) => r.result === "조건부");
  return (
    <Link
      href={`/prototype/policy/${policy.id}`}
      className="flex flex-col gap-2 rounded-2xl border border-gray-200 p-4 active:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-gray-400">{policy.theme}</span>
        <VerdictBadge verdict={verdict.verdict} />
      </div>
      <h3 className="text-base font-bold text-gray-900">{policy.name}</h3>
      <p className="line-clamp-2 text-sm text-gray-400">{policy.summary}</p>
      {verdict.verdict === "조건부" && topConditional && (
        <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
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
        <h2 className="text-sm font-bold text-gray-800">
          {title} <span className="text-gray-400">{items.length}</span>
        </h2>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
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

  const totalShown = rec.matched.length + rec.conditional.length;

  return (
    <Shell
      title={`${data.nickname}님을 위한 정책`}
      description={
        totalShown > 0
          ? "입력한 조건으로 판정한 결과예요. 카드를 눌러 판정 근거를 확인하세요."
          : "관심 분야에서 바로 해당되는 정책을 찾지 못했어요. 조건을 바꿔보거나 아래 대상 아님 목록을 확인해보세요."
      }
    >
      <div className="flex flex-col gap-8">
        <Section
          title="받을 수 있어요"
          hint="입력한 조건으로 대상에 해당하는 정책"
          items={rec.matched}
        />
        <Section
          title="조건만 맞으면 돼요"
          hint="자동으로 확정 못 한 조건이 있어요 — 근거를 보고 직접 판단하세요"
          items={rec.conditional}
        />

        {rec.excluded.length > 0 && (
          <details className="rounded-2xl bg-gray-50 p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-400">
              대상이 아닌 정책 {rec.excluded.length}개 보기
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {rec.excluded.map((r) => (
                <PolicyCard key={r.policy.id} ranked={r} />
              ))}
            </div>
          </details>
        )}

        <Link
          href="/prototype/interests"
          className="text-center text-sm font-medium text-gray-400 underline"
        >
          관심 분야 다시 고르기
        </Link>
      </div>
    </Shell>
  );
}
