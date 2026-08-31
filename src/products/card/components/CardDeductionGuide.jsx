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
        <label className="mb-2 block text-[14px] font-bold text-slate-800">연 총급여</label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={salary}
              onChange={(e) => setSalary(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="예: 5000"
              className="w-44 rounded-md border border-slate-300 py-2.5 pl-3.5 pr-12 text-[16px] font-semibold tabular-nums focus:border-rose-500 focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">만원</span>
          </div>
          <div className="flex gap-1.5">
            {[3000, 5000, 8000].map((v) => (
              <Preset key={v} active={s === v} onClick={() => setSalary(String(v))}>
                {won(v)}
              </Preset>
            ))}
          </div>
        </div>
      </div>

      {s > 0 ? (
        <div className="px-5 py-5">
          {/* 문턱 */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
            <div className="text-[12.5px] font-semibold text-slate-500">소득공제 시작 문턱 (연 카드사용액)</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-[28px] font-black tabular-nums text-rose-700">{won(threshold)}</span>
              <span className="text-[13px] text-slate-500">총급여 {won(s)}의 25%</span>
            </div>
          </div>

          {/* 구간별 전략 표 */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["구간", "소득공제", "카드 전략"].map((h) => (
                    <th key={h} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-bold text-slate-600 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 px-3 py-2.5 align-top font-semibold text-slate-800 whitespace-nowrap">
                    문턱까지<div className="text-[11.5px] font-normal text-slate-400">~ {won(threshold)}</div>
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5 align-top text-slate-600">공제 없음</td>
                  <td className="border border-slate-200 px-3 py-2.5 align-top text-slate-700">캐시백·할인 큰 신용카드</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 px-3 py-2.5 align-top font-semibold text-slate-800 whitespace-nowrap">
                    문턱 초과분<div className="text-[11.5px] font-normal text-slate-400">{won(threshold)} 초과</div>
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5 align-top text-slate-600">
                    신용 15%<br />체크·현금 30%<br />전통시장·대중교통 40%
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5 align-top text-slate-700">
                    공제율은 체크가 높지만, 캐시백이 더 큰 신용카드도 함께 비교
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-slate-50 px-3 py-2.5">
            <span className="text-[12.5px] font-semibold text-slate-500">연 공제한도</span>
            <span className="text-[15px] font-bold tabular-nums text-slate-900">{limit}만원</span>
            <span className="text-[12px] text-slate-400">
              총급여 7천만원 {s <= 7000 ? "이하" : "초과"} 기준 · 전통시장·대중교통·도서공연 추가한도 별도
            </span>
          </div>

          <Link
            to={ctaTo}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-slate-700"
          >
            <CreditCard className="h-4 w-4" />
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            참고용 추정입니다. 실제 공제액은 총급여·기존 카드사용액·부양가족·세법 개정에 따라 달라집니다.
          </p>
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-[13px] text-slate-400">
          연 총급여를 입력하면 소득공제 문턱과 카드 전략을 계산합니다.
        </div>
      )}
    </div>
  );
}
