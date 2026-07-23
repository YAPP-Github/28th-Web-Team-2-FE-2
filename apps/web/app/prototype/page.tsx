"use client";

// [1/4] 닉네임 입력 — 로그인 대신 닉네임 하나로 프로세스 진입.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { usePrototypeSession } from "./_lib/session";
import { Shell } from "./_lib/ui";

export default function NicknamePage() {
  const router = useRouter();
  const { data, loaded, update } = usePrototypeSession();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (loaded && data.nickname) setNickname(data.nickname);
  }, [loaded, data.nickname]);

  const canProceed = nickname.trim().length > 0;

  const handleNext = () => {
    if (!canProceed) return;
    update({ nickname: nickname.trim() });
    router.push("/prototype/profile");
  };

  return (
    <Shell
      title="어떻게 부를까요?"
      description="로그인 없이, 닉네임만으로 나에게 맞는 청년정책을 찾아볼게요."
      footer={
        <ActionButton className="w-full" disabled={!canProceed} onClick={handleNext}>
          시작하기
        </ActionButton>
      }
    >
      <TextField
        label="닉네임"
        value={nickname}
        onValueChange={({ value }) => setNickname(value)}
        maxGraphemeCount={12}
      >
        <TextFieldInput placeholder="예: 정책탐험가" />
      </TextField>
    </Shell>
  );
}
