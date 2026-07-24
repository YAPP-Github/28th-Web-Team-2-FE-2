"use client";

// 사용자 제보 크라우드소싱 스토어 — 프로토타입은 localStorage에 저장(기기별 유지).
// 실서비스 전환 시 이 파일만 Spring BFF 호출로 교체하면 화면은 그대로 동작.

import { useSyncExternalStore } from "react";
import { SEED_REPORTS } from "./vegetables";
import type { Report } from "./types";

const STORAGE_KEY = "veg-reports-v1";
const listeners = new Set<() => void>();
// useSyncExternalStore는 스냅샷 참조가 안정적이어야 함 → 쓰기 때만 교체하는 캐시.
let cache: Report[] | null = null;

function readLocal(): Report[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Report[]) : [];
  } catch {
    return [];
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Report[] {
  if (cache === null) cache = readLocal();
  return cache;
}

function getServerSnapshot(): Report[] {
  return [];
}

export interface NewReportInput {
  vegetableId: string;
  district: string;
  weightKg: number;
  price: number;
  method: Report["method"];
}

export function addReport(input: NewReportInput): Report {
  const report: Report = {
    id: `local-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    vegetableId: input.vegetableId,
    district: input.district,
    weightKg: input.weightKg,
    price: input.price,
    pricePerKg: input.weightKg > 0 ? Math.round(input.price / input.weightKg) : input.price,
    createdAt: new Date().toISOString(),
    method: input.method,
  };
  const next = [report, ...readLocal()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
  return report;
}

/** 시드 + 로컬 제보를 합쳐 필터·최신순 정렬해 반환. */
export function useReports(filter?: { vegetableId?: string; district?: string }): Report[] {
  const local = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const merged = [...local, ...SEED_REPORTS];
  const filtered = merged.filter(
    (r) =>
      (!filter?.vegetableId || r.vegetableId === filter.vegetableId) &&
      (!filter?.district || r.district === filter.district),
  );
  return filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
