import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { SAMPLE_CUSTOMERS } from "../data/grossTax";
import { cn } from "@shared/lib/format";

/* 홈 대시보드용 종합과세 관리 빠른 진입 — 고객번호 넣으면 /tax로 바로 조회 */
export function GrossTaxCard() {
  const [no, setNo] = useState("");
  const navigate = useNavigate();
  const go = (value) => navigate(`/tax?no=${value ?? no}`);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (no.length === 9) go();
        }}
        className="flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={no}
            onChange={(e) => setNo(e.target.value.replace(/\D/g, "").slice(0, 9))}
            inputMode="numeric"
            maxLength={9}
            placeholder="고객번호 9자리"
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-[14px] tabular-nums focus:border-im-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={no.length !== 9}
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          조회
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-400">예시</span>
        {SAMPLE_CUSTOMERS.map((c) => (
          <button
            key={c.customerNo}
            onClick={() => go(c.customerNo)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-700 transition-colors hover:border-im-300 hover:text-im-700"
          >
            <span className="font-mono tabular-nums">{c.customerNo}</span>
            <span className="text-[10px] font-medium text-slate-400">{c.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
