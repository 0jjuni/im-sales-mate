import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { HubShell } from "./HubShell";
import { searchFaqs, SEARCH_COUNT } from "@shared/lib/search";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 전역 검색 결과 — 상단 네비 검색창에서 넘어온 ?q= 로 전 모듈 FAQ를 훑는다.
   결과는 해당 모듈 FAQ 페이지로 연결. (상세 앵커 딥링크는 이후 확장) */
const MODULE_TONE = {
  노란우산: "bg-amber-100 text-amber-800",
  ISA: "bg-rose-100 text-rose-800",
  연금: "bg-violet-100 text-violet-800",
};

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const results = searchFaqs(q);

  useEffect(() => {
    const prev = document.title;
    document.title = q ? `"${q}" 검색 · iM 세일즈메이트` : "검색 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, [q]);

  return (
    <HubShell>
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">검색</h1>
        <p className="mt-1 text-[12.5px] text-slate-500">
          {q ? (
            <>
              「<span className="font-bold text-slate-900">{q}</span>」 결과{" "}
              <span className="font-bold text-im-700">{results.length}건</span> · 전 모듈 FAQ {SEARCH_COUNT}건에서
            </>
          ) : (
            <>상단 검색창에 궁금한 내용을 입력하세요. 노란우산·ISA·연금 FAQ를 한 번에 찾습니다.</>
          )}
        </p>
      </div>

      {results.length === 0 ? (
        <div className={cn(CARD, "flex flex-col items-center gap-2 px-5 py-12 text-center")}>
          <SearchX className="h-7 w-7 text-slate-300" />
          <p className="text-[13px] font-semibold text-slate-600">
            {q ? "일치하는 FAQ가 없습니다." : "검색어를 입력해 주세요."}
          </p>
          {q && (
            <p className="max-w-sm text-[12px] leading-relaxed text-slate-400">
              다른 단어로 다시 찾아보시거나, 각 모듈의 FAQ에서 직접 확인해 주세요.
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {results.map((r, i) => (
            <li key={i}>
              <Link
                to={r.to}
                className={cn(
                  CARD,
                  "block p-4 transition-all hover:-translate-y-0.5 hover:border-im-200 hover:shadow-[0_10px_28px_-12px_rgba(6,161,137,0.25)]"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-sm px-1.5 py-0.5 text-[10px] font-bold",
                      MODULE_TONE[r.module] || "bg-slate-100 text-slate-600"
                    )}
                  >
                    {r.module}
                  </span>
                  {r.ref && <span className="text-[10px] text-slate-400">{r.ref}</span>}
                </div>
                <div className="mt-1.5 text-[14px] font-bold leading-snug text-slate-900">
                  {r.question}
                </div>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-600">
                  {r.answer}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </HubShell>
  );
}
