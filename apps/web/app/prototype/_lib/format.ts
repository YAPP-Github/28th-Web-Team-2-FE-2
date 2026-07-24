// 표시 포맷터 — 순수 함수 (서버·클라 공용).

/** 2490 → "2,490원" */
export function formatWon(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

/** 2490 → "2,490" (단위 없이) */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("ko-KR");
}

/** "2026-07-24" → "26.07.24" */
export function formatDateDot(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

/** "2026-07-24" → "7/24" (그래프 축) */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}
