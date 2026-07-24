// 공공 시세(기준선) 서버 fetch 함수 — 외부 KAMIS OpenAPI 앞단.
// ⚠️ 서버 전용: 클라이언트에서 import 금지 (인증키가 서버에만 있어야 함, conventions #7).
//    (server-only 패키지 미설치 → 주석 가드. 리뷰 시 도입 검토 권장.)
//
// 데이터 소스 판정(API 조사): KAMIS 소매가의 최소 지역 해상도는 광역(서울=1개)이라
// 자치구(광진구) 단위 시세는 공공 API로 불가 → region은 광역, 동네 정밀도는 사용자 제보로 메운다.

import "server-only"; // 클라이언트에서 import 시 빌드 실패 — 인증키의 서버 격리 강제.
import { DEFAULT_REGION, getBaselineDummy, getVegetable } from "./vegetables";
import type { BaselinePrice } from "./types";

// 실연결 대비 참조 (키 수령 후 매핑 구현):
//   GET http://www.kamis.or.kr/service/price/xml.do?action=periodProductList
//   params: p_cert_key, p_cert_id, p_product_cls_code(01 소매), p_item_category_code,
//           p_item_code, p_startday, p_endday, p_returntype(json)
// const KAMIS_ENDPOINT = "http://www.kamis.or.kr/service/price/xml.do";

/**
 * 품목 기준 시세를 반환한다.
 * - 인증키(KAMIS_CERT_KEY/ID)가 없으면 더미로 폴백 (프로토타입이 항상 동작).
 * - 키가 있어도 실 매핑은 스펙 확정 전까지 TODO — 상상 파싱 대신 더미 유지(figma-bridge 원칙).
 */
export async function getBaselinePrice(
  vegetableId: string,
  region: string = DEFAULT_REGION,
): Promise<BaselinePrice> {
  const certKey = process.env.KAMIS_CERT_KEY;
  const certId = process.env.KAMIS_CERT_ID;
  const veg = getVegetable(vegetableId);

  if (!veg || !certKey || !certId) {
    return getBaselineDummy(vegetableId, region);
  }

  // TODO(✍️): 키 수령 후 실 KAMIS 호출·정규화 구현.
  //   const url = `${KAMIS_ENDPOINT}?action=periodProductList&p_cert_key=${certKey}` +
  //     `&p_cert_id=${certId}&p_returntype=json&p_product_cls_code=01` +
  //     `&p_item_category_code=${veg.itemCategoryCode}&p_item_code=${veg.itemCode}` +
  //     `&p_startday=...&p_endday=...`;
  //   시세는 하루 1회 갱신 → revalidate 1시간(뮤테이션 없어 revalidateTag 불필요):
  //   const res = await fetch(url, { next: { revalidate: 3600, tags: ["prices"] } });
  //   return normalizeKamis(await res.json(), veg, region);
  return getBaselineDummy(vegetableId, region);
}
