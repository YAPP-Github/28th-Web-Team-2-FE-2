"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import IconMagnifyingglassLine from "@karrotmarket/react-monochrome-icon/IconMagnifyingglassLine";
import { VEGETABLES } from "../_lib/vegetables";

// 검색 + 인기 야채 그리드 (검색이 그리드를 필터하므로 한 클라이언트 컴포넌트).
export function HomeVegetables() {
  const [query, setQuery] = useState("");
  const keyword = query.trim();
  const list = keyword ? VEGETABLES.filter((v) => v.name.includes(keyword)) : VEGETABLES;

  return (
    <div className="flex flex-col gap-5">
      {/* 검색 — 채운 회색 pill (Figma) */}
      <div className="flex h-13 items-center gap-2 rounded-2xl bg-bg-neutral-weak px-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="야채 검색"
          placeholder="시세가 궁금한 야채를 검색해 보세요"
          className="min-w-0 flex-1 bg-transparent text-body-16-regular text-fg-neutral outline-none placeholder:text-fg-neutral-subtle"
        />
        <span className="shrink-0 text-fg-neutral-subtle [&_svg]:size-6" aria-hidden="true">
          <IconMagnifyingglassLine />
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-head2-16 text-fg-neutral">{keyword ? "검색 결과" : "인기 야채"}</h2>

        {list.length === 0 ? (
          <p className="py-12 text-center text-body-14-regular text-fg-neutral-subtle">
            &lsquo;{keyword}&rsquo; 검색 결과가 없어요
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-3">
            {list.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/prototype/price/${v.id}`}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-bg-neutral-weak py-4 active:bg-bg-neutral-weak-pressed"
                >
                  <span className="flex h-[72px] items-center justify-center">
                    <Image
                      src={v.image}
                      alt=""
                      width={64}
                      height={72}
                      className="h-[72px] w-auto object-contain"
                    />
                  </span>
                  <span className="text-body-14-medium text-fg-neutral">{v.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
