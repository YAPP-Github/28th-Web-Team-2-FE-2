import { getBaselinePrice } from "../../prototype/_lib/kamis";
import { getVegetable } from "../../prototype/_lib/vegetables";

// 시세 BFF — 외부 KAMIS 앞단 프록시(conventions #7). 인증키는 서버(kamis.ts)에만 존재하고
// 클라이언트 번들·응답에 노출되지 않는다. 캐싱·정규화도 여기(서버)까지.
// 현재 시세는 RSC가 getBaselinePrice로 서버에서 직접 가져가므로, 이 라우트는
// 향후 클라이언트 호출/외부 노출용 진입점으로 둔다(api-patterns 3층 구조).
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const item = searchParams.get("item");
  if (!item) {
    return Response.json({ error: "item 파라미터가 필요해요." }, { status: 400 });
  }
  if (!getVegetable(item)) {
    return Response.json({ error: `알 수 없는 품목: ${item}` }, { status: 404 });
  }
  const region = searchParams.get("region") ?? undefined;
  const baseline = await getBaselinePrice(item, region);
  return Response.json(baseline);
}
