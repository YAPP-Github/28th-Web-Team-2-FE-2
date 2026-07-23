"use client";

// 로그인 없는 UT 프로토타입 세션 — 닉네임+프로필+관심테마를 localStorage에 보관해
// 화면을 넘나들어도 유지한다. (백엔드/인증 없음 — design-guide §1-2)

import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "@/lib/youth-policy/profile";

const STORAGE_KEY = "ut-prototype-session";

export type SessionData = Partial<UserProfile>;

export interface UsePrototypeSession {
  data: SessionData;
  /** localStorage 로드 완료 여부. false 동안은 렌더 분기를 미룬다(hydration 불일치 방지). */
  loaded: boolean;
  update: (patch: SessionData) => void;
  reset: () => void;
}

export function usePrototypeSession(): UsePrototypeSession {
  const [data, setData] = useState<SessionData>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as SessionData);
    } catch {
      // 파싱 실패 시 빈 세션으로 시작
    }
    setLoaded(true);
  }, []);

  const update = useCallback((patch: SessionData) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 저장 실패는 프로토타입에서 무시
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
    }
    setData({});
  }, []);

  return { data, loaded, update, reset };
}
