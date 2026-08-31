import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserSearch, ArrowRight } from "lucide-react";
import { SAMPLE_CUSTOMERS } from "@hub/data/grossTax";
import { cn } from "@shared/lib/format";

/* 상시 진입점 — 모든 화면 상단바에서 고객번호로 「고객 종합 진단」을 바로 시작한다.
   버튼을 누르면 작은 팝오버에 고객번호 입력·예시가 뜨고, 조회 시 /tax로 이동한다.
   상단바의 '고객 진단' 탭이 화면 이동이라면, 이쪽은 어느 화면에서든 즉시 조회를 여는 액션. */
export function QuickCustomerLookup() {
  const [open, setOpen] = useState(false);
  const [no, setNo] = useState("");
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const go = (value) => {
    navigate(`/tax?no=${value ?? no}`);
    setOpen(false);
    setNo("");
  };

  /* 바깥 클릭·ESC로 닫기 */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        title="고객번호로 종합 진단 시작"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-bold transition-colors",
          open ? "bg-im-600 text-white" : "bg-im-50 text-im-700 hover:bg-im-100"
        )}
      >
        <UserSearch className="h-4 w-4" />
        <span className="hidden sm:inline">고객 조회</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[19rem] rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
          <p className="mb-2 text-[12px] font-bold text-slate-700">고객 종합 진단 시작</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (no.length === 9) go();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={no}
              onChange={(e) => setNo(e.target.value.replace(/\D/g, "").slice(0, 9))}
              inputMode="numeric"
              maxLength={9}
              placeholder="고객번호 9자리"
              className="min-w-0 flex-1 rounded-md border border-slate-300 py-2 px-3 text-[14px] tabular-nums focus:border-im-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={no.length !== 9}
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-md bg-im-600 px-3 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11.5px] font-semibold text-slate-700 transition-colors hover:border-im-300 hover:text-im-700"
              >
                <span className="font-mono tabular-nums">{c.customerNo}</span>
                <span className="text-[10px] font-medium text-slate-400">{c.tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
