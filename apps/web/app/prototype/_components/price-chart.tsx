"use client";

import { type PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import type { PricePeriod, PricePoint } from "../_lib/types";
import { formatShortDate, formatWon } from "../_lib/format";

const PERIOD_LABEL: Record<PricePeriod, string> = { week: "일주일", month: "1개월", year: "1년" };
const PERIODS: PricePeriod[] = ["week", "month", "year"];

const VIEW_W = 350;
const VIEW_H = 130;
const PAD_Y = 18;

const BRAND = "var(--seed-color-bg-brand-solid, #ff6f0f)";
const DARK = "var(--seed-color-bg-neutral-inverted, #262f3c)";
const GRID = "var(--seed-color-stroke-neutral, #d0d5dd)";

function scaleY(price: number, min: number, range: number): number {
  return PAD_Y + (1 - (price - min) / range) * (VIEW_H - 2 * PAD_Y);
}

export function PriceChart({
  vegetableName,
  series,
}: {
  vegetableName: string;
  series: Record<PricePeriod, PricePoint[]>;
}) {
  const [period, setPeriod] = useState<PricePeriod>("week");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const points = series[period];
  const n = points.length;
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const avg = Math.round(prices.reduce((s, p) => s + p, 0) / n / 10) * 10;

  const coords = points.map((p, i) => ({
    x: n > 1 ? (i / (n - 1)) * VIEW_W : VIEW_W / 2,
    y: scaleY(p.price, min, range),
  }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const avgY = scaleY(avg, min, range);

  const idx = activeIdx ?? n - 1;
  const active = coords[idx];
  const activePoint = points[idx];
  const labelIdx = [0, Math.floor((n - 1) / 2), n - 1];

  function handlePointer(e: ReactPointerEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setActiveIdx(Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))));
  }

  const xPct = (active.x / VIEW_W) * 100;
  const yPct = (active.y / VIEW_H) * 100;

  return (
    <section className="flex flex-col gap-4" aria-label={`${vegetableName} 시세 그래프`}>
      <h2 className="text-head2-16 text-fg-neutral">{vegetableName} 시세 그래프</h2>

      {/* 기간 세그먼트 */}
      <div role="group" aria-label="조회 기간" className="flex gap-1 rounded-xl bg-bg-neutral-weak p-1">
        {PERIODS.map((p) => {
          const selected = p === period;
          return (
            <button
              key={p}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setPeriod(p);
                setActiveIdx(null);
              }}
              className={`min-h-11 flex-1 rounded-lg py-2 text-body-14-medium transition-colors ${
                selected ? "bg-bg-layer-default text-fg-neutral shadow-sm" : "text-fg-neutral-subtle"
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          );
        })}
      </div>

      {/* 그래프 (터치/호버로 지점 이동) */}
      <div
        ref={containerRef}
        className="relative w-full touch-pan-y"
        onPointerDown={handlePointer}
        onPointerMove={(e) => e.buttons > 0 && handlePointer(e)}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          role="img"
          aria-label={`${PERIOD_LABEL[period]} 시세 추이, ${formatShortDate(activePoint.date)} ${formatWon(activePoint.price)}`}
        >
          <line
            x1="0"
            y1={avgY}
            x2={VIEW_W}
            y2={avgY}
            stroke={GRID}
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={line}
            fill="none"
            stroke={BRAND}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={active.x} cy={active.y} r="4.5" fill={BRAND} />
        </svg>

        {/* 툴팁 말풍선 */}
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg px-2.5 py-1.5 text-center"
          style={{ left: `${Math.min(86, Math.max(14, xPct))}%`, top: `calc(${yPct}% - 12px)`, backgroundColor: DARK }}
        >
          <p className="text-caption-12-regular whitespace-nowrap text-fg-neutral-inverted">
            {formatShortDate(activePoint.date)}
          </p>
          <p className="text-body-14-medium whitespace-nowrap text-fg-neutral-inverted">
            {formatWon(activePoint.price)}
          </p>
          <span
            className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent"
            style={{ borderTopColor: DARK }}
          />
        </div>
      </div>

      {/* x축 라벨 */}
      <div className="flex justify-between px-1 text-caption-12-regular text-fg-neutral-subtle">
        {labelIdx.map((li, i) => (
          <span key={i}>{formatShortDate(points[li].date)}</span>
        ))}
      </div>

      {/* 선택 기간 평균가 */}
      <div className="flex items-center justify-between rounded-xl border border-bg-neutral-weak px-4 py-4">
        <span className="text-body-14-medium text-fg-neutral-subtle">{PERIOD_LABEL[period]} 평균가</span>
        <span className="text-body-16-semibold text-fg-neutral">{formatWon(avg)}</span>
      </div>
    </section>
  );
}
