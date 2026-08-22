"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/button";
import type { StoreRequest } from "@/app/_lib/api/schemas/reports";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { PHOTO_MESSAGE } from "@/app/_lib/report-photo-messages";
import { ROUTES } from "@/app/_lib/routes";
import { submitReportAction } from "./_actions";
import {
  FieldInput,
  FieldSelect,
  FieldUnitDisplay,
  type ReportUnit,
} from "./_components/field-price";
import { PhotoDropzone } from "./_components/photo-dropzone";
import { PhotoPreview } from "./_components/photo-preview";
import { ReportCtaFooter } from "./_components/report-cta-footer";
import { ScanModal } from "./_components/scan-modal";
import { clearReportPhoto, loadReportPhoto, saveReportPhoto } from "./_lib/photo-draft";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// F04-1 야채 제보 폼의 인터랙션 leaf — Figma 화면GUI(원본) 364:8145 · 8173 · 8201 · 8236 · 8265.
//
// Figma 5프레임은 별개 화면이 아니라 **같은 폼의 상태**다:
//   8145 · 8173  사진 없음(dropzone)  ← 두 프레임의 자식 좌표가 **완전히 동일**하다(중복)
//   8201         사진 인식 모달이 폼 위에 떠 있음 (폼은 아직 dropzone)
//   8236 · 8265  사진 등록됨(preview) ← 라벨 이름만 다르고 사실상 중복
// 그래서 라우트를 나누지 않고 이 컴포넌트의 상태로 처리한다.
//
// ── Figma를 그대로 베끼지 않은 곳 ─────────────────────────────────────────────
//  1. 루트가 Figma에서는 자식 전부 absolute다. 폼 **내부**는 auto-layout이 정상이라
//     루트만 세로 흐름으로 바꿨다(실측 gap 40이 일관돼 gap-10 하나로 대체된다).
//  2. Status Bar(364:8171)는 iOS 목업이라 구현 대상이 아니다 → Figma의 top 좌표(헤더 44 ·
//     폼 121)를 그대로 옮기지 않고, **헤더 아래 여백만 실측 28px(pt-7)**을 지킨다.
//  3. 프레임 높이 1000은 콘텐츠 길이일 뿐이라 옮기지 않았다 — 본문을 스크롤시키고 CTA를 고정한다.
//  4. 제목·라벨 고정 폭(179 · 358)을 버렸다. 한국어 텍스트에 고정 폭을 주면 실데이터에서 깨진다.
//
// ── Figma에 정의가 없어 코드가 정한 것 (전부 GUI피드백.md에 기록) ────────────────
//  · 사진은 서버에 업로드하거나 인식하지 않는다. 사진을 고르면 인식 대기 모달을 잠시 보여준 뒤
//    브라우저 로컬 미리보기로 전환한다. 파일 로드가 실패하면 사진을 버리고 다시 고를 수 있게 한다.
//  · 단위는 `kg`·`g`·`개`·`포기` 중 사용자가 선택해 제보한다.
//  · CTA "확인"의 이동 대상이 명시돼 있지 않다 → F04-4 제보 완료로 보냈다(플로우상 유일한 전진 경로).
//
// ── 2026-08-19: 실 Spring 연동으로 코드가 새로 내린 판단 ────────────────────────
//  · **reportType을 "PURCHASE"로 고정한다.** Figma 어디에도 "구매/목격"을 고르는 토글이 없다.
//    유일하게 UI가 있는 흐름(사진 찍어 가격 입력)이 "실제로 산 가격 확인"에 가깝다고 보고
//    골랐다 — 토글이 생기면 `_actions.ts`의 `FIXED_REPORT_TYPE` 하나만 바꾸면 된다.
//  · 사진 원본은 품목·장소 화면을 다녀와도 잃지 않도록 `_lib/photo-draft.ts`의 IndexedDB에
//    임시 보관하지만 제보 요청에는 포함하지 않는다.
//  · **F04-2 카테고리 매핑**(한글 7종 ↔ Spring `ItemCategory`)은 `_data.ts`가 `(tabs)/prices`의
//    기존 `PRICE_GROUPS` 매핑을 재사용한다 — 판단 근거는 그 파일 머리말 참고.
//
// 상태 3종(2026-08-19 갱신): 이제 성립한다 — 제출 API가 붙었다.
//   로딩 = 제출 버튼 `state="loading"` (아래 handleSubmit)
//   에러 = 401(로그인 필요)·409(중복 제보)·400(입력값)·기타를 구분해 CTA 위에 안내(아래 submitError)
//   빈  = 이 화면 자체엔 없음(F04-2·F04-3 목록 화면의 몫)

export interface ReportFormProps {
  /** F04-2에서 고른 품목 itemId. vegetableName과 항상 짝을 맞춰 넘긴다(둘 다 있거나 둘 다 없거나). */
  itemId?: number;
  /** F04-2에서 고른 품목. 없으면 고르라고 안내한다. */
  vegetableName?: string;
  /** 선택된 품목의 defaultUnit — 화면과 제보 payload 모두 이 원문을 사용한다. */
  unitType?: string;
  /** F04-3에서 고른 판매 장소 — 제출 시 그대로 실어 보낸다. */
  store?: StoreRequest;
  /** 가게 상세에서 진입한 기존 매장 ID — 이 경우 새 매장 정보 대신 `storeId`로 제출한다. */
  storeId?: number;
  /** 화면에 보여줄 장소 이름. */
  placeName?: string;
  /** 선택값을 물고 다니기 위한 현재 쿼리스트링(품목·장소 화면으로 넘길 때 붙인다). */
  carryQuery: string;
  /** URL의 `price`(숫자 문자열) — 장소 화면을 다녀와도 입력값이 살아남게 하는 값. */
  initialPrice?: string;
  /** URL의 `amount`(숫자 문자열). */
  initialAmount?: string;
  /** URL의 `unit`(선택 단위). */
  initialUnit?: string;
}

type PhotoState = {
  file: File;
  url: string;
  scanning: boolean;
} | null;

const LOCAL_SCAN_DELAY_MS = 1_500;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatPriceInput(value: string): string {
  const digits = digitsOnly(value);
  return digits ? Number(digits).toLocaleString("ko-KR") : "";
}

function normalizeReportUnit(unit: string | undefined): ReportUnit | undefined {
  const match = unit?.trim().match(/(kg|g|개|포기)$/);
  return match?.[1] as ReportUnit | undefined;
}

/**
 * "판매 장소" 화면으로 나갈 때 현재 입력한 가격·양을 쿼리에 얹는다.
 *
 * 장소 선택은 별도 라우트라 폼이 통째로 다시 마운트된다 — 사진은 IndexedDB로 따로
 * 보관해 살아남지만, 가격·양은 로컬 state뿐이라 그냥 두면 장소를 고르고 돌아왔을 때
 * 지워져 있었다(2026-08-21 버그 리포트). `item`이 그대로면 값은 여전히 유효하므로
 * URL에 실어 왕복시킨다. 품목을 다시 고르는 링크는 건드리지 않는다 — 품목이 바뀌면
 * 가격도 그 품목 기준으로 다시 입력해야 해서, 폼을 통째로 리셋하는 기존 동작
 * (`page.tsx`의 `key={itemId}`)이 맞다.
 */
function buildPlaceQuery(carryQuery: string, price: string, amount: string, unit?: ReportUnit): string {
  const params = new URLSearchParams(carryQuery.startsWith("?") ? carryQuery.slice(1) : carryQuery);
  const priceDigits = digitsOnly(price);
  if (priceDigits) params.set("price", priceDigits);
  if (amount.trim()) params.set("amount", amount);
  if (unit) params.set("unit", unit);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function buildItemQuery(carryQuery: string, itemId: number | undefined): string {
  const params = new URLSearchParams(carryQuery.startsWith("?") ? carryQuery.slice(1) : carryQuery);
  if (itemId !== undefined) params.set("item", String(itemId));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function ReportForm({
  itemId,
  vegetableName,
  unitType,
  store,
  storeId,
  placeName,
  carryQuery,
  initialPrice,
  initialAmount,
  initialUnit,
}: ReportFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<PhotoState>(null);
  const [photoError, setPhotoError] = useState("");
  const [price, setPrice] = useState(() => formatPriceInput(initialPrice ?? ""));
  const [amount, setAmount] = useState(() => digitsOnly(initialAmount ?? ""));
  const [reportUnit, setReportUnit] = useState<ReportUnit | undefined>(() =>
    normalizeReportUnit(initialUnit) ?? normalizeReportUnit(unitType),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const selectedItemId = itemId;
  const selectedVegetableName = vegetableName;
  const reportCarryQuery = buildItemQuery(carryQuery, selectedItemId);

  // 품목·장소 선택은 별도 라우트로 이동하므로 컴포넌트가 다시 마운트된다. 사진 원본은
  // IndexedDB에 잠시 보관해 돌아왔을 때 미리보기와 제출용 File을 함께 복원한다.
  useEffect(() => {
    let active = true;
    void loadReportPhoto().then((file) => {
      if (!active || !file) return;
      setPhoto({
        file: file.file,
        url: URL.createObjectURL(file.file),
        scanning: false,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  // 객체 URL은 컴포넌트가 사라질 때 반드시 해제한다 — 안 하면 탭을 떠날 때마다 누적된다.
  useEffect(() => {
    const url = photo?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [photo?.url]);

  useEffect(() => {
    if (!photo?.scanning) return;
    const timeoutId = window.setTimeout(() => {
      setPhoto((current) => (current ? { ...current, scanning: false } : current));
    }, LOCAL_SCAN_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [photo?.scanning]);

  // Figma에 검증 규칙 정의가 없다(위 ⚠️). `shared/pages.md` F04-1이 "필수는 품목·가격·양"이라고
  // 적어 두었지만 **판매 장소도 포함시켰다** — "어디서 본 가격인가"가 이 플로우의 존재 이유이고,
  // 장소 없는 제보는 시세 비교에 쓸 수 없다. 규칙을 발명하면서 일부만 발명하는 게 더 위험하다.
  // (pages.md의 "필수 3종"이 정본이면 이 줄에서 placeName만 빼면 된다)
  const canSubmit =
    Boolean(selectedItemId) &&
    Boolean(selectedVegetableName) &&
    Boolean(store || storeId) &&
    Boolean(placeName) &&
    Boolean(reportUnit) &&
    price.trim() !== "" &&
    amount.trim() !== "";

  function handlePickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 고를 수 있어야 하므로 input 값을 비운다.
    event.target.value = "";
    if (!file) return;
    setPhotoError("");
    setPhoto({ file, url: URL.createObjectURL(file), scanning: true });
    void saveReportPhoto(file);
  }

  async function handleSubmit() {
    // canSubmit이 이미 품목·장소 존재를 보장하지만, 타입을 좁히려면 다시 확인해야 한다.
    if (
      !canSubmit ||
      isSubmitting ||
      !selectedItemId ||
      (!store && storeId === undefined) ||
      !reportUnit
    ) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setPhotoError("");
    try {
      const result = await submitReportAction({
        itemId: selectedItemId,
        store,
        storeId,
        price: Number(digitsOnly(price)),
        amount: Number(amount),
        unit: reportUnit,
      });
      if (result.status === "success") {
        await clearReportPhoto();
        router.push(ROUTES.reportDone);
        return;
      }
      setSubmitError(result.message);
    } catch (error) {
      // 예기치 못한 원문은 화면에 옮기지 않고 콘솔에만 남긴다.
      console.error("[report] 제보 제출 실패", error);
      setSubmitError("제보를 등록하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/*
        pb-20(80px): Figma [F04-1_야채 제보](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=831-34939)
        실측 — report-form-place 하단 846 · section/cta 상단 926 → 간격 **80px**.
        08-20에는 40px로 넣었다가 "화면 상에서는 더 좁아 보인다"는 재지적을 받아 실측값으로 맞췄다.
      */}
      <div className="flex-1 overflow-y-auto px-4 pt-7 pb-20">
        <div className="flex flex-col gap-10">
          <h1 className="text-title-24-semibold text-content-primary">
            야채의 실제 가격을
            <br />
            알려주세요
          </h1>

          <div className="flex flex-col gap-10">
            <FieldBlock label="야채 사진">
              {photo ? (
                <PhotoPreview
                  removeButton={
                    <button
                      type="button"
                      aria-label="사진 삭제"
                      className="flex size-6 items-center justify-center rounded-full bg-surface-inverse"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoError("");
                        void clearReportPhoto();
                      }}
                    >
                      <FigmaIcon
                        name="close"
                        width={16}
                        currentColor
                        className="text-content-inverse"
                      />
                    </button>
                  }
                >
                  <Image
                    src={photo.url}
                    alt="등록한 야채 사진"
                    width={124}
                    height={124}
                    unoptimized
                    className="size-full object-cover"
                    onError={() => {
                      setPhoto(null);
                      void clearReportPhoto();
                      setPhotoError(PHOTO_MESSAGE.load);
                    }}
                  />
                </PhotoPreview>
              ) : (
                <PhotoDropzone
                  icon={<FigmaIcon name="sparkle" width={24} />}
                  action={
                    <Button
                      variant="primary"
                      size="small"
                      leading={false}
                      trailing={false}
                      className="w-full"
                      onClick={() => fileRef.current?.click()}
                    >
                      사진 등록하기
                    </Button>
                  }
                />
              )}
              {photoError ? (
                <p className="text-caption-12-medium text-content-error" role="alert">
                  {photoError}
                </p>
              ) : null}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={handlePickFile}
              />
            </FieldBlock>

            <FieldBlock label="제보 품목">
              <FieldSelect
                value={selectedVegetableName ?? "품목을 선택해 주세요"}
                actionLabel={selectedVegetableName ? "다시 선택" : "선택"}
                href={`${ROUTES.reportVegetable}${reportCarryQuery}`}
                ariaLabel={
                  selectedVegetableName
                    ? `제보 품목 ${selectedVegetableName}, 다시 선택`
                    : "제보 품목 선택"
                }
              />
            </FieldBlock>

            <FieldBlock label="가격" htmlFor="report-price">
              <FieldInput
                id="report-price"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="가격을 입력해 주세요"
                value={price}
                onChange={(event) => setPrice(formatPriceInput(event.target.value))}
                suffix="원"
              />
            </FieldBlock>

            <FieldBlock label="양" htmlFor="report-amount">
              {/* Figma 364:8165 — flex gap-[4px], 양 입력이 flex-1, 단위가 124 고정. */}
              <div className="flex w-full items-center gap-1">
                <FieldInput
                  id="report-amount"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1"
                  value={amount}
                  className="min-w-0 flex-1"
                  onChange={(event) => setAmount(digitsOnly(event.target.value))}
                />
                <FieldUnitDisplay
                  unit={reportUnit}
                  onChange={setReportUnit}
                />
              </div>
            </FieldBlock>

            <FieldBlock label="판매 장소">
              <FieldSelect
                value={placeName ?? "장소를 선택해 주세요"}
                actionLabel={placeName ? "위치 변경" : "선택"}
                href={`${ROUTES.reportPlace}${buildPlaceQuery(reportCarryQuery, price, amount, reportUnit)}`}
                ariaLabel={placeName ? `판매 장소 ${placeName}, 위치 변경` : "판매 장소 선택"}
              />
            </FieldBlock>
          </div>
        </div>
      </div>

      <ReportCtaFooter
        // Figma에 제출 실패 상태가 없다 — 기존 `above` 슬롯(원래 F04-4 보조 링크용)을
        // 에러 안내에 재사용한다. above 유무로 상단 패딩이 12→8로 바뀌는 건 의도된 동작이다.
        above={
          submitError ? (
            <p role="alert" className="text-caption-12-medium text-content-error">
              {submitError}
            </p>
          ) : null
        }
      >
        <Button
          variant="secondary"
          leading={false}
          trailing={false}
          className="w-full"
          disabled={!canSubmit || isSubmitting || Boolean(photo?.scanning)}
          state={isSubmitting ? "loading" : "normal"}
          onClick={handleSubmit}
        >
          확인
        </Button>
      </ReportCtaFooter>

      {photo?.scanning ? (
        <ScanModal
          onClose={() => setPhoto((current) => (current ? { ...current, scanning: false } : current))}
        />
      ) : null}
    </>
  );
}

/**
 * Figma의 필드 블록 — 라벨 + gap-[8px] + 입력.
 * 라벨은 caption/12-medium · content/primary (364:8151 계열 실측).
 *
 * `htmlFor`를 넘기면 `<label>`로 렌더해 라벨을 탭했을 때 입력에 포커스가 간다.
 * 입력이 아닌 블록(사진 등록·이동 링크)은 `<p>`로 남는다 — `<label>`이 가리킬 대상이 없다.
 */
function FieldBlock({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-2">
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="w-full text-caption-12-medium text-content-primary"
        >
          {label}
        </label>
      ) : (
        <p className="w-full text-caption-12-medium text-content-primary">{label}</p>
      )}
      {children}
    </div>
  );
}
