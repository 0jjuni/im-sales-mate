import { useMemo, useState } from "react";
import { MapPin, AlertTriangle, Check, Copy, Printer } from "lucide-react";
import { convertAddress } from "../lib/address";
import { UtilitySlip } from "../components/UtilitySlip";
import { cn } from "@shared/lib/format";

/* 영문 주소 변환기.
   근거: 도로명주소법 시행규칙 로마자 표기 방법 + 국어의 로마자 표기법

   규칙 기반 변환이라 외래어가 들어간 도로명(예: 센텀중앙로)은 소리대로 옮겨져
   공식 표기와 다를 수 있다. 표기가 정확히 맞아야 하는 서식은 공식 영문주소로
   확인해야 한다. */

const EXAMPLES = [
  "서울특별시 강남구 테헤란로 152",
  "대구광역시 수성구 달구벌대로 2310",
  "경기도 성남시 분당구 판교역로 235",
];

const CopyRow = ({ value, label, emphasis }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      onClick={copy}
      title="복사"
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
        emphasis
          ? "border-2 border-sky-300 bg-sky-50/50"
          : "border-slate-200 bg-white hover:border-sky-400",
        copied && "border-sky-500"
      )}
    >
      <span className="min-w-0 flex-1">
        {label && (
          <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-sky-700">
            {label}
          </span>
        )}
        <span
          className={cn(
            "block break-words text-slate-900",
            /* 서식에 옮겨 적는 용도라 강조 결과는 크게 */
          emphasis ? "text-[17px] font-bold leading-relaxed tracking-wide" : "text-[13.5px]"
          )}
        >
          {value}
        </span>
      </span>
      {copied ? (
        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
      ) : (
        <Copy className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300 group-hover:text-slate-500" />
      )}
    </button>
  );
};

export const AddressConverter = () => {
  const [input, setInput] = useState("");
  const result = useMemo(() => convertAddress(input), [input]);

  return (
    <>
    <div className="space-y-5 print:hidden">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          영문 주소 변환기
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          한글 도로명주소를 영문 표기로 바꿉니다.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-r-sm border-l-4 border-amber-500 bg-amber-50/60 px-4 py-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-slate-800">
          외래어가 섞인 도로명은 소리대로 옮겨져 공식 표기와 다를 수 있습니다. 정확히 맞아야 하는
          서식은 공식 영문주소로 확인해 주세요.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <label className="mb-1.5 block text-xs font-bold text-slate-700">
          한글 도로명주소
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="예: 서울특별시 강남구 테헤란로 152"
            className="w-full resize-y rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-[14px] leading-relaxed focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500">예시</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setInput(ex)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 transition-colors hover:border-sky-400 hover:text-sky-700"
            >
              {ex}
            </button>
          ))}
        </div>

        {result && (
          <div className="mt-4 space-y-2">
            <CopyRow value={result.full} label="영문 주소 (국가명 포함)" emphasis />
            {result.english && result.english !== result.full && (
              <CopyRow value={result.english} label="국가명 없이" />
            )}

            {result.incomplete && (
              <div className="flex items-start gap-2 rounded-sm border border-amber-200 bg-amber-50/60 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                <p className="text-[11.5px] leading-relaxed text-slate-700">
                  {!result.parts.road
                    ? "도로명과 건물번호를 찾지 못했습니다. 지번주소이거나 형식이 달라 보이니 도로명주소로 다시 입력해 주세요."
                    : "시/도를 찾지 못했습니다. 「서울특별시」처럼 앞에 시·도를 포함해 입력해 주세요."}
                </p>
              </div>
            )}

            {result.parenthetical.length > 0 && (
              <p className="text-[11.5px] leading-relaxed text-slate-500">
                괄호 안 참고항목({result.parenthetical.join(", ")})은 영문 주소에 넣지 않는 것이
                일반적이라 제외했습니다.
              </p>
            )}

            <button
              onClick={() => window.print()}
              title="전표 형태로 인쇄합니다"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <Printer className="h-4 w-4" />
              전표 인쇄
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11.5px] leading-relaxed text-slate-600">
        <strong className="text-slate-800">근거</strong> 도로명주소 로마자 표기 규칙. 작은 단위부터
        역순으로 적고, 도로 유형(daero·ro·gil)과 행정구역(si·gun·gu·eup·myeon·dong·ri)은 붙임표로
        잇습니다.
      </div>
    </div>

    {result && (
      <UtilitySlip
        title="영문 주소 표기"
        rows={[
          { label: "한글 주소", value: input.trim() },
          { label: "영문 주소", value: result.full, emphasis: true },
          ...(result.zip ? [{ label: "우편번호", value: result.zip }] : []),
        ]}
        note="도로명주소 로마자 표기 규칙에 따른 표기입니다. 표기가 정확히 일치해야 하는 서식은 공식 영문주소로 확인하시기 바랍니다."
      />
    )}
    </>
  );
};
