"use client";

// [3/4] 관심 테마 — 온통청년 대분류(일자리·주거·교육·복지문화·참여권리)로 추천 1차 필터.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { Chip } from "seed-design/ui/chip";
import { THEME_OPTIONS } from "@/lib/youth-policy/profile";
import type { PolicyTheme } from "@/lib/youth-policy/types";
import { usePrototypeSession } from "../_lib/session";
import { Shell } from "../_lib/ui";

export default function InterestsPage() {
  const router = useRouter();
  const { data, loaded, update } = usePrototypeSession();
  const [interests, setInterests] = useState<PolicyTheme[]>([]);

  useEffect(() => {
    if (!loaded) return;
    if (!data.nickname) {
      router.replace("/prototype");
      return;
    }
    if (data.interests) setInterests(data.interests);
  }, [loaded, data, router]);

  const toggle = (theme: PolicyTheme, checked: boolean) => {
    setInterests((prev) =>
      checked ? [...prev, theme] : prev.filter((t) => t !== theme),
    );
  };

  const handleNext = () => {
    update({ interests });
    router.push("/prototype/recommend");
  };

  return (
    <Shell
      title="어떤 게 궁금해요?"
      description="관심 있는 분야를 고르면 그 분야부터 추천해요. 안 골라도 전체에서 찾아드려요."
      step={2}
      totalSteps={4}
      footer={
        <ActionButton className="w-full" onClick={handleNext}>
          {interests.length > 0 ? `${interests.length}개 선택 · 추천 보기` : "전체에서 추천 보기"}
        </ActionButton>
      }
    >
      <div className="flex flex-wrap gap-2">
        {THEME_OPTIONS.map((theme) => (
          <Chip.Toggle
            key={theme}
            size="large"
            checked={interests.includes(theme)}
            onCheckedChange={(checked) => toggle(theme, checked)}
          >
            <Chip.Label>{theme}</Chip.Label>
          </Chip.Toggle>
        ))}
      </div>
    </Shell>
  );
}
