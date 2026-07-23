"use client";

// SEED 정석 select 패턴 — FieldButton(필드형 버튼) 탭 → BottomSheet 목록에서 선택.
// (SEED엔 컴팩트 드롭다운이 없어 모바일에선 이 조합이 표준.)
import { useState, type ReactNode } from "react";
import IconChevronDownLine from "@karrotmarket/react-monochrome-icon/IconChevronDownLine";
import IconCheckmarkLine from "@karrotmarket/react-monochrome-icon/IconCheckmarkLine";
import { Icon } from "@seed-design/react";
import {
  FieldButton,
  FieldButtonPlaceholder,
  FieldButtonValue,
} from "seed-design/ui/field-button";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  description?: ReactNode;
}

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  description,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FieldButton
        label={label}
        description={description}
        suffixIcon={<IconChevronDownLine />}
        buttonProps={{
          onClick: () => setOpen(true),
          "aria-label": value ? `${label}: ${value}, 변경하기` : `${label} 선택하기`,
          "aria-haspopup": "dialog",
        }}
      >
        {value ? (
          <FieldButtonValue>{value}</FieldButtonValue>
        ) : (
          <FieldButtonPlaceholder>{placeholder}</FieldButtonPlaceholder>
        )}
      </FieldButton>

      <BottomSheetRoot open={open} onOpenChange={setOpen}>
        <BottomSheetContent title={label}>
          <BottomSheetBody>
            <ul
              className="flex flex-col overflow-y-auto"
              style={{ maxHeight: "60vh" }}
            >
              {options.map((opt) => {
                const selected = opt === value;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      aria-current={selected ? "true" : undefined}
                      onClick={() => {
                        onChange(opt);
                        setOpen(false);
                      }}
                      className={`t5-regular flex w-full items-center justify-between py-3.5 text-left active:bg-bg-layer-default-pressed ${selected ? "text-fg-brand" : "text-fg-neutral"}`}
                    >
                      {opt}
                      {selected && <Icon svg={<IconCheckmarkLine />} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheetRoot>
    </>
  );
}
