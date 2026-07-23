"use client";

// [2/4] 핵심 프로필 — 대부분 공고가 공유하는 공통 5축(나이·지역·취업상태·소득·학력)만 1회 수집.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { RadioGroup, RadioGroupItem } from "seed-design/ui/radio-group";
import {
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  INCOME_OPTIONS,
  REGION_OPTIONS,
  type EducationChoice,
  type EmploymentChoice,
  type IncomeBand,
  type RegionChoice,
} from "@/lib/youth-policy/profile";
import { usePrototypeSession } from "../_lib/session";
import { Shell } from "../_lib/ui";

export default function ProfilePage() {
  const router = useRouter();
  const { data, loaded, update } = usePrototypeSession();

  const [age, setAge] = useState("");
  const [region, setRegion] = useState<RegionChoice | "">("");
  const [employment, setEmployment] = useState<EmploymentChoice | "">("");
  const [incomeBand, setIncomeBand] = useState<IncomeBand | "">("");
  const [education, setEducation] = useState<EducationChoice | "">("");

  useEffect(() => {
    if (!loaded) return;
    if (!data.nickname) {
      router.replace("/prototype");
      return;
    }
    if (typeof data.age === "number") setAge(String(data.age));
    if (data.region) setRegion(data.region);
    if (data.employment) setEmployment(data.employment);
    if (data.incomeBand) setIncomeBand(data.incomeBand);
    if (data.education) setEducation(data.education);
  }, [loaded, data, router]);

  const ageNum = Number(age);
  const ageValid = age !== "" && Number.isFinite(ageNum) && ageNum > 0 && ageNum < 120;
  const canProceed = ageValid && region && employment && incomeBand && education;

  const handleNext = () => {
    if (!canProceed) return;
    update({
      age: ageNum,
      region: region as RegionChoice,
      employment: employment as EmploymentChoice,
      incomeBand: incomeBand as IncomeBand,
      education: education as EducationChoice,
    });
    router.push("/prototype/interests");
  };

  return (
    <Shell
      title="기본 정보를 알려주세요"
      description="자격을 판정할 만큼만 물어봐요. 이 정보는 브라우저에만 저장돼요."
      step={1}
      totalSteps={4}
      footer={
        <ActionButton className="w-full" disabled={!canProceed} onClick={handleNext}>
          다음
        </ActionButton>
      }
    >
      <div className="flex flex-col gap-7">
        <TextField
          label="나이 (만 나이)"
          value={age}
          onValueChange={({ value }) => setAge(value.replace(/[^0-9]/g, ""))}
        >
          <TextFieldInput inputMode="numeric" placeholder="예: 29" />
        </TextField>

        <RadioGroup
          label="거주 지역"
          value={region}
          onValueChange={(v) => setRegion(v as RegionChoice)}
        >
          {REGION_OPTIONS.map((o) => (
            <RadioGroupItem key={o} value={o} label={o} />
          ))}
        </RadioGroup>

        <RadioGroup
          label="현재 상태"
          value={employment}
          onValueChange={(v) => setEmployment(v as EmploymentChoice)}
        >
          {EMPLOYMENT_OPTIONS.map((o) => (
            <RadioGroupItem key={o} value={o} label={o} />
          ))}
        </RadioGroup>

        <RadioGroup
          label="연 소득 구간"
          description="정밀 판정에 쓰여요. 모르면 '무관'을 골라도 돼요."
          value={incomeBand}
          onValueChange={(v) => setIncomeBand(v as IncomeBand)}
        >
          {INCOME_OPTIONS.map((o) => (
            <RadioGroupItem key={o.value} value={o.value} label={o.label} />
          ))}
        </RadioGroup>

        <RadioGroup
          label="학력"
          value={education}
          onValueChange={(v) => setEducation(v as EducationChoice)}
        >
          {EDUCATION_OPTIONS.map((o) => (
            <RadioGroupItem key={o} value={o} label={o} />
          ))}
        </RadioGroup>
      </div>
    </Shell>
  );
}
