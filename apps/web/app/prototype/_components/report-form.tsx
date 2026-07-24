"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, BottomBar, PhoneFrame, Scroll, StatusBar } from "../_lib/shell";
import { getVegetable, VEGETABLES } from "../_lib/vegetables";
import { useCurrentDistrict } from "../_lib/location";
import { addReport } from "../_lib/reports-store";
import type { Report } from "../_lib/types";

// F04 야채 제보 — 위치는 GPS 자동, 나머지 직접 입력 → localStorage 저장 → 시세 화면 복귀.
// 확인 버튼은 유효할 때만 활성(Figma) → 별도 에러 문구 없이 비활성으로 안내.
export function ReportForm({ item, method }: { item: string; method: Report["method"] }) {
  const router = useRouter();
  const presetVeg = getVegetable(item);
  const { district, loading } = useCurrentDistrict();

  const [itemName, setItemName] = useState(presetVeg?.name ?? "");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const veg = presetVeg ?? VEGETABLES.find((v) => v.name === itemName.trim());
  const weightNum = Number(weight.replace(/[^0-9.]/g, ""));
  const priceNum = Number(price.replace(/[^0-9]/g, ""));
  const formValid = !!veg && weightNum > 0 && priceNum > 0 && !loading;
  const closeHref = presetVeg ? `/prototype/price/${presetVeg.id}` : "/prototype";

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!formValid || !veg) return;
    addReport({ vegetableId: veg.id, district, weightKg: weightNum, price: priceNum, method });
    router.push(`/prototype/price/${veg.id}`);
  }

  return (
    <PhoneFrame>
      <StatusBar />
      <AppBar backHref={closeHref} />
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <Scroll className="px-4 pb-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-head2-20 leading-snug text-fg-neutral">
              야채의 실제 가격을
              <br />
              알려주세요
            </h1>
            <Image src="/ui/cart.png" alt="" width={80} height={70} className="mt-1 h-16 w-auto shrink-0 object-contain" />
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {/* 위치 — GPS 자동, 잠금 */}
            <TextField label="위치" value={loading ? "위치 확인 중…" : district} onValueChange={() => {}} readOnly>
              <TextFieldInput />
            </TextField>

            <TextField
              label="품목"
              value={itemName}
              onValueChange={(v) => setItemName(v.value)}
              readOnly={!!presetVeg}
            >
              <TextFieldInput placeholder="예: 감자" />
            </TextField>

            <TextField label="양(무게)" value={weight} onValueChange={(v) => setWeight(v.value)} suffix="kg">
              <TextFieldInput placeholder="0" inputMode="decimal" />
            </TextField>

            <TextField label="가격" value={price} onValueChange={(v) => setPrice(v.value)} suffix="원">
              <TextFieldInput placeholder="0" inputMode="numeric" />
            </TextField>
          </div>
        </Scroll>

        <BottomBar>
          <ActionButton
            type="submit"
            variant="neutralSolid"
            size="large"
            className="w-full"
            disabled={!formValid}
          >
            확인
          </ActionButton>
        </BottomBar>
      </form>
    </PhoneFrame>
  );
}
