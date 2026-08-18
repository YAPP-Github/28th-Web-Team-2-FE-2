import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("BFF 상태 확인 응답을 제공한다", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual({
    status: "ok",
    service: "web-2-fe-2 bff",
  });
});

test("온보딩 첫 화면의 접근성 트리와 WCAG 위반을 검사한다", async ({ page }) => {
  await page.goto("/onboarding");

  await expect(page.getByRole("heading", { name: "우리 동네 야채 시세" })).toBeVisible();
  await expect(page.getByRole("button", { name: "카카오로 시작하기" })).toBeEnabled();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
