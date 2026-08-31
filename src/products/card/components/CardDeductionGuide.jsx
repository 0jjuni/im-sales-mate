import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, ArrowRight } from "lucide-react";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

/* 신용카드 소득공제 가이드 — 대략적인 연 총급여로 공제 문턱(총급여 25%)을 계산해
   "얼마까지 신용카드가 유리한지"를 보여주고 카드 권유로 연결한다.
   종합과세 관리 페이지와 카드 모듈 「소득공제」 탭에서 공용으로 쓴다. */

const won = (manwon) => {
  const m = Math.round(manwon);
  if (m >= 10000) {
    const eok = Math.floor(m / 10000);
    const rest = m % 10000;
    return rest ? `${eok}억 ${rest.toLocaleString()}만원` : `${eok}억원`;
  }
  return `${m.toLocaleString()}만원`;
};

const Preset = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      "rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors",
      active ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
    )}
  >
    {children}
  </button>
);

export function CardDeductionGuide({ ctaTo = "/card", ctaLabel = "iM 카드 추천 보기" }) {
  const [salary, setSalary] = useState("");
  const s = Number(salary) || 0;
  const threshold = Math.round(s * 0.25);
  const limit = s === 0 ? null : s <= 7000 ? 300 : 250;

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      <div className="border-b border-slate-100 px-5 py-4">
        <label className="mb-1.5 block text-[12px] font-bold text-slate-500">연 총급여 (대략 · 만원)</label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={salary}
              onChange={(e) => setSalary(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="예: 5000"
              className="w-40 rounded-md border border-slate-300 py-2 pl-3 pr-10 text-[14px] tabular-nums focus:border-rose-500 focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">만원</span>
          </div>
          <div className="flex gap-1">
            {[3000, 5000, 8000].map((v) => (
              <Preset key={v} active={s === v} onClick={() => setSalary(String(v))}>
                {won(v)}
              </Preset>
            ))}
          </div>
        </div>
      </div>

      {s > 0 ? (
        <div className="px-5 py-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
            <div className="text-[12px] text-slate-500">소득공제 시작 문턱 · 연 카드사용액</div>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
              <span className="text-[24px] font-bold tabular-nums text-rose-700">{won(threshold)}</span>
              <span className="text-[12px] text-slate-500">= 총급여 {won(s)}의 25%</span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
              카드 사용액이 이 문턱을 넘어야 소득공제가 시작됩니다. 문턱까지는 어차피 공제가 없으니{" "}
              <strong className="font-semibold text-slate-800">캐시백·할인 혜택이 큰 신용카드</strong>로 쓰는 게 유리합니다.
            </p>
          </div>

          <ul className="mt-3 space-y-2">
            <li className="flex gap-2.5 rounded-lg border border-slate-200 bg-white p-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">1</span>
              <p className="text-[12.5px] leading-relaxed text-slate-700">
                <strong className="font-bold text-slate-900">문턱({won(threshold)})까지</strong> — 혜택 좋은 신용카드로. 공제는 없지만 캐시백·할인으로 실속을 챙깁니다.
              </p>
            </li>
            <li className="flex gap-2.5 rounded-lg border border-slate-200 bg-white p-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">2</span>
              <p className="text-[12.5px] leading-relaxed text-slate-700">
                <strong className="font-bold text-slate-900">문턱 초과분</strong> — 소득공제 시작(신용 15% · 체크/현금 30% · 전통시장·대중교통 40%). 연 공제한도 {limit}만원(총급여 7천만원 {s <= 7000 ? "이하" : "초과"} 기준). 공제만 보면 초과분은 체크가 유리하나, 신용카드 캐시백이 공제 차액보다 큰 경우가 많아 함께 비교해 권유하세요.
              </p>
            </li>
          </ul>

          <Link
            to={ctaTo}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-slate-700"
          >
            <CreditCard className="h-4 w-4" />
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            참고용 추정입니다. 실제 공제액은 총급여·기존 카드사용액·부양가족·세법 개정 등에 따라 달라지며, 공제한도 외 전통시장·대중교통·도서공연 추가한도가 별도로 적용됩니다. 단정 안내는 피해 주세요.
          </p>
        </div>
      ) : (
        <div className="px-5 py-6 text-center text-[12.5px] text-slate-400">
          연 총급여를 입력하면 소득공제 문턱과 카드 활용 전략을 계산합니다.
        </div>
      )}
    </div>
  );
}
