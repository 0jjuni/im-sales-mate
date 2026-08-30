import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, FileText, Megaphone, Plus, Search, X, Heart } from "lucide-react";
import { CARDS, CARD_TYPES, ALL_TAGS } from "../data/cards";
import { cn } from "@shared/lib/format";

/* 관심 카드 — 뷰어별 로컬 저장(직원 개인 브라우저) */
const FAV_KEY = "salesbridge.card.favs";
const loadFavs = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
  } catch {
    return new Set();
  }
};

/* 카드 탐색 — 카드고릴라식 가로 리스트 + 혜택 태그 검색/필터.
   상단 신용/체크 탭, 검색어(이름·혜택·태그), 태그 칩으로 거른다.
   가입 문구가 등록된 카드는 「가입 안내문」을 바로 출력, 미등록 카드는 등록 후 출력. */

const CardThumb = ({ card }) => {
  const [err, setErr] = useState(false);
  if (card.image && !err) {
    return (
      <img
        src={card.image}
        alt={card.name}
        onError={() => setErr(true)}
        className="h-[116px] w-[92px] flex-shrink-0 rounded-lg object-contain"
      />
    );
  }
  return (
    <div className="flex h-[116px] w-[92px] flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
      <CreditCard className="h-6 w-6" />
    </div>
  );
};

const CardRow = ({ card, fav, onFav }) => {
  const ready = !!card.adCopy;
  return (
    <div className="relative flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-[0_10px_30px_-16px_rgba(15,23,42,0.25)] sm:flex-row sm:items-center sm:p-5">
      <button
        onClick={() => onFav(card.id)}
        aria-label={fav ? "관심 해제" : "관심 등록"}
        aria-pressed={fav}
        className="absolute right-3 top-3 z-10 rounded-full p-1 text-slate-300 transition-colors hover:text-rose-400"
      >
        <Heart className={cn("h-5 w-5", fav && "fill-rose-500 text-rose-500")} />
      </button>

      <Link to={`/card/${card.id}`} className="group flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
        <CardThumb card={card} />
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold text-slate-900 group-hover:text-rose-700">{card.name}</h3>

          {card.blurb && (
            <p className="mt-1.5 text-[15px] font-semibold leading-snug text-slate-800">{card.blurb}</p>
          )}

          {card.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11.5px] text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {(card.annualFee || card.spendReq || card.note) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-slate-500">
              {card.annualFee && <span>연회비 {card.annualFee}</span>}
              {card.spendReq && <span>{card.spendReq}</span>}
              {card.note && <span className="text-slate-600">{card.note}</span>}
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-shrink-0 items-center gap-2 sm:w-[168px] sm:flex-col sm:items-stretch">
        <Link
          to={`/card/promo?card=${card.id}`}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-bold transition-colors",
            ready
              ? "bg-slate-900 text-white hover:bg-slate-700"
              : "border border-dashed border-slate-300 text-slate-500 hover:border-rose-400 hover:text-rose-700"
          )}
        >
          {ready ? (
            <>
              <Megaphone className="h-4 w-4" />
              가입 안내문
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              가입 안내문 추가
            </>
          )}
        </Link>

        {card.prospectusUrl && (
          <a
            href={card.prospectusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            <FileText className="h-4 w-4" />
            상품설명서
          </a>
        )}
      </div>
    </div>
  );
};

export const CardCatalog = () => {
  const [type, setType] = useState("credit");
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [favs, setFavs] = useState(loadFavs);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    } catch {
      /* 저장 불가(프라이빗 모드 등) — 화면 상태는 유지 */
    }
  }, [favs]);

  const toggleFav = (id) =>
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const byType = useMemo(() => CARDS.filter((c) => c.type === type), [type]);

  /* 현재 탭 카드들이 실제로 가진 태그만, 마스터 순서대로 노출 */
  const availableTags = useMemo(() => {
    const set = new Set(byType.flatMap((c) => c.tags || []));
    return ALL_TAGS.filter((t) => set.has(t));
  }, [byType]);

  const toggleTag = (t) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = byType.filter((c) => {
      const matchTag = activeTags.length === 0 || (c.tags || []).some((t) => activeTags.includes(t));
      if (!matchTag) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.blurb || ""} ${(c.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
    /* 가입 링크(문구)가 등록돼 바로 QR 출력 가능한 카드를 앞으로 */
    return filtered.sort((a, b) => (b.adCopy ? 1 : 0) - (a.adCopy ? 1 : 0));
  }, [byType, query, activeTags]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">카드 탐색</h1>
        <p className="mt-1 text-sm text-slate-600">
          고객에게 권유할 카드를 고르면, 가입 링크 QR과 심의필 문구가 담긴 안내문을 바로 인쇄할 수 있습니다.
        </p>
      </div>

      {/* 신용/체크 탭 */}
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        {CARD_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setType(t.id);
              setActiveTags([]);
            }}
            className={cn(
              "rounded-md px-4 py-1.5 text-[13px] font-bold transition-colors",
              type === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="카드명·혜택·태그로 검색 (예: 커피, 대중교통, 마일리지)"
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-9 text-[13px] focus:border-rose-500 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="검색어 지우기"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 태그 필터 */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map((t) => {
            const on = activeTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
                  on
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-rose-400 hover:text-rose-700"
                )}
              >
                {t}
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button
              onClick={() => setActiveTags([])}
              className="rounded-full px-3 py-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600"
            >
              필터 해제
            </button>
          )}
        </div>
      )}

      <div className="text-[12px] text-slate-400">{list.length}개 카드</div>

      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map((c) => (
            <CardRow key={c.id} card={c} fav={favs.has(c.id)} onFav={toggleFav} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-10 text-center text-[13px] text-slate-500">
          조건에 맞는 카드가 없습니다.
        </div>
      )}
    </div>
  );
};
