"use client";

// 공고 상세 + 자격판정 (기능② 타겟 A) — 된다/안된다/조건부 + 판정 근거(추적가능 원칙).
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@seed-design/react";
import { ActionButton } from "seed-design/ui/action-button";
import { isCompleteProfile } from "@/lib/youth-policy/profile";
import { judgePolicy } from "@/lib/youth-policy/judge";
import { getPolicyById } from "@/lib/youth-policy/source";
import type { VerdictKind } from "@/lib/youth-policy/types";
import { usePrototypeSession } from "../../_lib/session";
import { Shell, THEME_ICON, VERDICT_STYLE } from "../../_lib/ui";

const RESULT_META: Record<VerdictKind, { dot: string; label: string }> = {
  해당: { dot: "bg-fg-positive", label: "해당" },
  조건부: { dot: "bg-fg-warning", label: "확인 필요" },
  비해당: { dot: "bg-fg-neutral-muted", label: "비해당" },
};

const RESULT_ORDER: Record<VerdictKind, number> = { 비해당: 0, 조건부: 1, 해당: 2 };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="t2-medium text-fg-neutral-muted">{label}</dt>
      <dd className="t4-regular text-fg-neutral">{value}</dd>
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

  const style = VERDICT_STYLE[verdict.verdict];
  const sortedReasons = [...verdict.reasons].sort(
    (a, b) => RESULT_ORDER[a.result] - RESULT_ORDER[b.result],
  );

  return (
    <Shell
      title={policy.name}
      description={policy.sourceInstitution}
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
        {/* 카테고리 */}
        <div>
          <span className="t3-medium inline-flex items-center gap-1 rounded-full bg-bg-layer-fill px-3 py-1 text-fg-neutral-subtle">
            <Icon svg={THEME_ICON[policy.theme]} />
            {policy.theme}
          </span>
        </div>

        {/* 판정 히어로 */}
        <section className={`flex flex-col gap-1 rounded-2xl p-5 ${style.panel}`}>
          <p className="t7-bold text-fg-neutral">{style.label}</p>
          <p className="t4-regular text-fg-neutral-subtle">{style.summary}</p>
          <p className="t3-medium mt-1 text-fg-neutral-muted">
            {data.nickname}님 입력 기준
          </p>
        </section>

        {/* 판정 근거 (추적가능) */}
        <section className="flex flex-col gap-3">
          <h2 className="t5-bold text-fg-neutral">판정 근거</h2>
          <ul className="flex flex-col gap-3">
            {sortedReasons.map((r, i) => (
              <li key={`${r.axis}-${i}`} className="flex gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${RESULT_META[r.result].dot}`}
                  aria-hidden="true"
                />
                <div className="flex flex-col">
                  <span className="t2-bold text-fg-neutral-muted">
                    {r.axis} · {RESULT_META[r.result].label}
                  </span>
                  <span className="t4-regular text-fg-neutral">{r.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 정책 정보 */}
        <section className="flex flex-col gap-4">
          <h2 className="t5-bold text-fg-neutral">정책 내용</h2>
          <p className="t4-regular text-fg-neutral">{policy.summary}</p>
          <dl className="flex flex-col gap-4 rounded-2xl bg-bg-layer-fill p-4">
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
