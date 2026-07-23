"use client";

// 개인정보 온보딩 — 4스텝 위저드. 카테고리는 여기서 안 고른다(결과 필터로 이동).
// select류는 SEED FieldButton+BottomSheet(SelectField), 소득은 기준 명확한 세전 연소득 입력.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import {
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  type EducationChoice,
  type EmploymentChoice,
} from "@/lib/youth-policy/profile";
import { SIDO_NAMES, getDistricts } from "@/lib/youth-policy/regions";
import { usePrototypeSession } from "../_lib/session";
import { SelectField } from "../_lib/select-field";
import { Shell } from "../_lib/ui";

const TOTAL_STEPS = 4;

const STEP_META = [
  { title: "나이가 어떻게 되세요?", description: "만 나이로 알려주세요. 대부분 정책이 연령으로 대상을 가려요." },
  { title: "어디에 사세요?", description: "지역 한정 정책을 가려내는 데 써요." },
  { title: "지금 어떤 상태예요?", description: "고용 형태에 따라 대상 여부가 달라져요." },
  { title: "소득과 학력을 알려주세요", description: "소득은 세전 연소득 기준이에요." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { data, loaded, update } = usePrototypeSession();

  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [regionSido, setRegionSido] = useState("");
  const [regionSigungu, setRegionSigungu] = useState("");
  const [employment, setEmployment] = useState<EmploymentChoice | "">("");
  const [income, setIncome] = useState(""); // 세전 연소득(만원)
  const [education, setEducation] = useState<EducationChoice | "">("");

  // 세션 복원은 최초 1회만 (매 update()마다 재실행하면 미저장 입력이 되돌아감).
  const restored = useRef(false);
  useEffect(() => {
    if (!loaded || restored.current) return;
    if (!data.nickname) {
      router.replace("/prototype");
      return;
    }
    restored.current = true;
    if (typeof data.age === "number") setAge(String(data.age));
    if (data.regionSido) setRegionSido(data.regionSido);
    if (data.regionSigungu) setRegionSigungu(data.regionSigungu);
    if (data.employment) setEmployment(data.employment);
    if (typeof data.annualIncomeManwon === "number") setIncome(String(data.annualIncomeManwon));
    if (data.education) setEducation(data.education);
  }, [loaded, data, router]);

  const ageNum = Number(age);
  const ageValid = age !== "" && Number.isFinite(ageNum) && ageNum > 0 && ageNum < 120;
  const districts = getDistricts(regionSido);
  const regionValid = !!regionSido && (districts.length === 0 || !!regionSigungu);
  const incomeValid = income !== "" && Number.isFinite(Number(income));

  const stepValid =
    step === 1
      ? ageValid
      : step === 2
        ? regionValid
        : step === 3
          ? !!employment
          : incomeValid && !!education;

  const handleBack = () => {
    if (step === 1) router.push("/prototype");
    else setStep((s) => s - 1);
  };

  const handleNext = () => {
    if (!stepValid) return;
    if (step === 1) update({ age: ageNum });
    if (step === 2) update({ regionSido, regionSigungu });
    if (step === 3) update({ employment: employment as EmploymentChoice });
    if (step === 4) {
      update({
        annualIncomeManwon: Number(income),
        education: education as EducationChoice,
      });
      router.push("/prototype/recommend");
      return;
    }
    setStep((s) => s + 1);
  };

  const meta = STEP_META[step - 1];

  return (
    <Shell
      title={meta.title}
      description={meta.description}
      step={step}
      totalSteps={TOTAL_STEPS}
      footer={
        <div className="flex gap-2">
          <ActionButton variant="neutralWeak" onClick={handleBack}>
            이전
          </ActionButton>
          <ActionButton className="flex-1" disabled={!stepValid} onClick={handleNext}>
            {step === TOTAL_STEPS ? "결과 보기" : "다음"}
          </ActionButton>
        </div>
      }
    >
      {step === 1 && (
        <TextField
          label="나이 (만 나이)"
          value={age}
          onValueChange={({ value }) => setAge(value.replace(/[^0-9]/g, ""))}
        >
          <TextFieldInput inputMode="numeric" placeholder="예: 29" />
        </TextField>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <SelectField
            label="시 / 도"
            placeholder="시/도를 선택하세요"
            value={regionSido}
            options={SIDO_NAMES}
            onChange={(v) => {
              setRegionSido(v);
              setRegionSigungu(""); // 시/도 바뀌면 하위 초기화
            }}
          />
          {regionSido && districts.length > 0 && (
            <SelectField
              label="시 / 군 / 구"
              placeholder="시/군/구를 선택하세요"
              value={regionSigungu}
              options={districts}
              onChange={setRegionSigungu}
            />
          )}
        </div>
      )}

      {step === 3 && (
        <SelectField
          label="현재 상태"
          placeholder="고용 형태를 선택하세요"
          value={employment}
          options={EMPLOYMENT_OPTIONS}
          onChange={(v) => setEmployment(v as EmploymentChoice)}
        />
      )}

      {step === 4 && (
        <div className="flex flex-col gap-7">
          <TextField
            label="세전 연소득"
            description="세금 떼기 전 1년 총소득(상여 포함), 본인 기준이에요. 소득이 없으면 0을 입력하세요."
            value={income}
            onValueChange={({ value }) => setIncome(value.replace(/[^0-9]/g, ""))}
            suffix="만원"
          >
            <TextFieldInput inputMode="numeric" placeholder="예: 3000" />
          </TextField>

          <SelectField
            label="학력"
            placeholder="학력을 선택하세요"
            value={education}
            options={EDUCATION_OPTIONS}
            onChange={(v) => setEducation(v as EducationChoice)}
          />
        </div>
      )}
    </Shell>
  );
}
