import { useState } from "react";
import { Search, ClipboardCheck, Check, X, UserRound, ShieldCheck } from "lucide-react";
import { CARD_REQUIREMENTS, queryEligibility, ELIGIBILITY_SAMPLES } from "../data/cardEligibility";
import { cn } from "@shared/lib/format";

/* 신용카드 발급 요건 조회 — 넥스피아 4개 요건으로 「이 요건으로 발급 가능한지」만 표시.
   실제 발급 가능 여부는 계정계에서 종합 필터링되며, 본 조회는 그중 4개 요건 참고용이다. */

const CARD = "rounded-xl border border-slate-200 bg-white";

const SampleChips = ({ onPick }) => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    <span className="text-[11px] text-slate-400">예시 고객:</span>
    {ELIGIBILITY_SAMPLES.map((s) => (
      <button
        key={s.customerNo}
        onClick={() => onPick(s.customerNo)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:text-rose-700"
      >
        <span className="font-mono tabular-nums">{s.customerNo}</span>
        <span className="text-[10px] font-medium text-slate-400">{s.tag}</span>
      </button>
    ))}
  </div>
);

const RequirementRow = ({ r }) => (
  <li className="flex items-center gap-3 px-5 py-3.5">
    <span
      className={cn(
        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
        r.met ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-300"
      )}
    >
      {r.met ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </span>
    <div className="min-w-0 flex-1">
      <div className="text-[13.5px] font-bold text-slate-900">{r.name}</div>
      <div className="mt-0.5 text-[11.5px] text-slate-400">{r.criteria}</div>
    </div>
    <span
      className={cn(
        "flex-shrink-0 rounded-md px-2.5 py-1 text-[12px] font-bold",
        r.met ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
      )}
    >
      {r.met ? "발급 가능" : "불가"}
    </span>
  </li>
);

function ResultView({ data }) {
  return (
    <div className="space-y-4">
      {/* 고객 + 종합 판정 */}
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-[16px] font-bold text-slate-900">{data.name}</span>
                <span className="text-[12px] text-slate-500">{data.age}</span>
                {data.profile && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">{data.profile}</span>
                )}
              </div>
              <div className="mt-0.5 font-mono text-[12px] tabular-nums text-slate-400">{data.customerNo}</div>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-bold",
              data.eligible ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            )}
          >
            {data.eligible ? <ShieldCheck className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {data.eligible ? `발급 가능 · ${data.metCount}개 요건 충족` : "충족 요건 없음"}
          </span>
        </div>
      </div>

      {/* 4개 요건 */}
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          발급 요건 (넥스피아 조회 4종)
        </div>
        <ul className="divide-y divide-slate-100">
          {data.requirements.map((r) => (
            <RequirementRow key={r.id} r={r} />
          ))}
        </ul>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-400">
        실제 발급 가능 여부는 계정계에서 여러 요건이 종합 심사되어 결정됩니다. 본 조회는 넥스피아에서 확인 가능한 4개 요건에 한한 참고용이며(데모, 표시 데이터는 예시), 요건별 충족 여부만 표시합니다.
      </p>
    </div>
  );
}

const IdleState = ({ onPick }) => (
  <div className={cn(CARD, "flex flex-col items-center gap-3 px-5 py-10 text-center")}>
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
      <ClipboardCheck className="h-6 w-6" />
    </div>
    <p className="text-[14px] font-semibold text-slate-700">고객번호 9자리를 입력하세요</p>
    <p className="max-w-md text-[12.5px] leading-relaxed text-slate-400">
      넥스피아에서 확인 가능한 4개 요건으로 발급 가능 여부를 조회합니다.
    </p>
    <div className="mt-1">
      <SampleChips onPick={onPick} />
    </div>
  </div>
);

const NotFound = ({ no, onPick }) => (
  <div className={cn(CARD, "flex flex-col items-center gap-2 px-5 py-12 text-center")}>
    <Search className="h-7 w-7 text-slate-300" />
    <p className="text-[13px] font-semibold text-slate-600">
      <span className="font-mono tabular-nums">{no}</span> · 조회 결과가 없습니다
    </p>
    <p className="max-w-sm text-[12px] leading-relaxed text-slate-400">데모에는 예시 고객만 등록돼 있습니다. 아래 번호로 확인해 보세요.</p>
    <div className="mt-2">
      <SampleChips onPick={onPick} />
    </div>
  </div>
);

export function CardEligibility() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(undefined); // undefined=미조회, null=결과없음, obj
  const [queriedNo, setQueriedNo] = useState("");

  const run = (no) => {
    const clean = (no ?? input).replace(/\D/g, "");
    setQueriedNo(clean);
    setResult(queryEligibility(clean));
  };
  const onSubmit = (e) => {
    e.preventDefault();
    run();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[16px] font-bold text-slate-900">신용카드 발급 요건 조회</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          넥스피아 4개 요건으로 발급 가능 여부를 확인합니다.
          <span className="text-slate-400"> · 실제 발급은 계정계 종합 심사 기준</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className={cn(CARD, "flex flex-wrap items-center gap-2 p-3")}>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 9))}
            inputMode="numeric"
            maxLength={9}
            placeholder="고객번호 9자리 입력"
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-[14px] tabular-nums focus:border-rose-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={input.length !== 9}
          className="flex-shrink-0 rounded-md bg-rose-600 px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          요건 조회
        </button>
      </form>

      {result === undefined ? (
        <IdleState onPick={(no) => { setInput(no); run(no); }} />
      ) : result === null ? (
        <NotFound no={queriedNo} onPick={(no) => { setInput(no); run(no); }} />
      ) : (
        <ResultView data={result} />
      )}
    </div>
  );
}
