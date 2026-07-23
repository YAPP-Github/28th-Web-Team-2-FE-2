"use client";

// 공고 상세 + 자격판정 (기능② 타겟 A) — 된다/안된다/조건부 + 판정 근거(추적가능 원칙).
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import { Callout } from "seed-design/ui/callout";
import { isCompleteProfile } from "@/lib/youth-policy/profile";
import { judgePolicy } from "@/lib/youth-policy/judge";
import { getPolicyById } from "@/lib/youth-policy/source";
import type { VerdictKind } from "@/lib/youth-policy/types";
import { usePrototypeSession } from "../../_lib/session";
import { Shell, VerdictBadge, VERDICT_STYLE } from "../../_lib/ui";

const RESULT_META: Record<VerdictKind, { dot: string; label: string }> = {
  해당: { dot: "bg-green-500", label: "해당" },
  조건부: { dot: "bg-amber-500", label: "확인 필요" },
  비해당: { dot: "bg-gray-400", label: "비해당" },
};

const RESULT_ORDER: Record<VerdictKind, number> = { 비해당: 0, 조건부: 1, 해당: 2 };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  );
}

export default function PolicyDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, loaded } = usePrototypeSession();

  const policy = useMemo(() => getPolicyById(params.id), [params.id]);
  const verdict = useMemo(
    () => (policy && isCompleteProfile(data) ? judgePolicy(policy, data) : null),
    [policy, data],
  );

  useEffect(() => {
    if (loaded && !isCompleteProfile(data)) router.replace("/prototype");
  }, [loaded, data, router]);

  if (!loaded || !isCompleteProfile(data)) {
    return <Shell title="불러오는 중…">{null}</Shell>;
  }

  if (!policy || !verdict) {
    return (
      <Shell
        title="공고를 찾을 수 없어요"
        footer={
          <ActionButton className="w-full" asChild>
            <Link href="/prototype/recommend">추천 목록으로</Link>
          </ActionButton>
        }
      >
        {null}
      </Shell>
    );
  }

  const sortedReasons = [...verdict.reasons].sort(
    (a, b) => RESULT_ORDER[a.result] - RESULT_ORDER[b.result],
  );

  return (
    <Shell
      title={policy.name}
      description={`${policy.theme} · ${policy.sourceInstitution}`}
      footer={
        <div className="flex flex-col gap-2">
          {policy.applyUrl && (
            <ActionButton className="w-full" asChild>
              <a href={policy.applyUrl} target="_blank" rel="noopener noreferrer">
                신청하러 가기
              </a>
            </ActionButton>
          )}
          <ActionButton className="w-full" variant="neutralWeak" asChild>
            <Link href="/prototype/recommend">추천 목록으로</Link>
          </ActionButton>
        </div>
      }
    >
      <div className="flex flex-col gap-7">
        {/* 판정 결과 */}
        <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <VerdictBadge verdict={verdict.verdict} />
            <span className="text-sm font-medium text-gray-800">
              {data.nickname}님 기준
            </span>
          </div>
          <Callout
            title={VERDICT_STYLE[verdict.verdict].label}
            description={VERDICT_STYLE[verdict.verdict].summary}
          />
        </section>

        {/* 판정 근거 (추적가능) */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-800">판정 근거</h2>
          <ul className="flex flex-col gap-3">
            {sortedReasons.map((r, i) => (
              <li key={`${r.axis}-${i}`} className="flex gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${RESULT_META[r.result].dot}`}
                  aria-hidden="true"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-400">
                    {r.axis} · {RESULT_META[r.result].label}
                  </span>
                  <span className="text-sm text-gray-800">{r.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 정책 정보 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-800">정책 내용</h2>
          <p className="text-sm text-gray-800">{policy.summary}</p>
          <dl className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4">
            <InfoRow label="지원 내용" value={policy.support} />
            <InfoRow label="신청 기간" value={policy.applyPeriod} />
            <InfoRow label="신청 방법" value={policy.applyMethod} />
            {policy.documents.length > 0 && (
              <InfoRow label="제출 서류" value={policy.documents.join(", ")} />
            )}
          </dl>
        </section>
      </div>
    </Shell>
  );
}
