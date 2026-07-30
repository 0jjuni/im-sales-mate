import { useMemo, useState } from "react";
import { MapPin, AlertTriangle, Check, Copy, ExternalLink, Printer } from "lucide-react";
import { convertAddress } from "../lib/address";
import { UtilitySlip } from "../components/UtilitySlip";
import { cn } from "@shared/lib/format";

/* 영문 주소 변환기.
   근거: 도로명주소법 시행규칙 로마자 표기 방법 + 국어의 로마자 표기법

   공식 영문주소는 도로명주소 안내시스템(juso.go.kr) 영문 검색 결과가 기준이다.
   이 도구는 그 조회 전에 형태를 빠르게 잡아 주고, 조회가 어려운 상황에서
   대략의 표기를 확인하는 보조 수단이다. */

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
        "group flex w-full items-start gap-3 rounded-md border px-3.5 py-3 text-left transition-colors",
        emphasis
          ? "border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-white"
          : "border-stone-200 bg-white hover:border-sky-400",
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
            "block break-words text-stone-900",
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
        <Copy className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-300 group-hover:text-stone-500" />
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
        <span className="text-xs uppercase tracking-widest text-sky-700 font-semibold">
          Address Romanization
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mt-1">
          영문 주소 변환기
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          카드 발급 신청서나 해외송금 서식에 적을 영문 주소를 만듭니다. 고객이 영문 주소를 모를 때
          대신 적어 드리는 용도입니다.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-r-sm border-l-4 border-amber-500 bg-amber-50/60 px-4 py-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-stone-800">
          해외송금처럼 표기가 정확히 맞아야 하는 서류는{" "}
          <strong>도로명주소 안내시스템의 영문 검색 결과</strong>를 쓰세요. 이 도구는 형태를 빠르게
          잡아 주는 보조 수단입니다.
        </p>
      </div>

      <div className="rounded-md border border-stone-200 bg-white p-5">
        <label className="mb-1.5 block text-xs font-bold text-stone-700">
          한글 도로명주소
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="예: 서울특별시 강남구 테헤란로 152"
            className="w-full resize-y rounded-md border border-stone-300 py-2.5 pl-9 pr-3 text-[14px] leading-relaxed focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-200"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-stone-500">예시</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setInput(ex)}
              className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-600 transition-colors hover:border-sky-400 hover:text-sky-700"
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
                <p className="text-[11.5px] leading-relaxed text-stone-700">
                  {!result.parts.road
                    ? "도로명과 건물번호를 찾지 못했습니다. 지번주소이거나 형식이 다를 수 있으니 도로명주소로 다시 입력하거나 아래에서 조회해 주세요."
                    : "시/도를 찾지 못했습니다. 「서울특별시」처럼 앞에 시·도를 포함해 입력해 주세요."}
                </p>
              </div>
            )}

            {result.parenthetical.length > 0 && (
              <p className="text-[11.5px] leading-relaxed text-stone-500">
                괄호 안 참고항목({result.parenthetical.join(", ")})은 영문 주소에 넣지 않는 것이
                일반적이라 제외했습니다.
              </p>
            )}

            <button
              onClick={() => window.print()}
              title="전표 형태로 인쇄합니다"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-stone-800"
            >
              <Printer className="h-4 w-4" />
              전표 인쇄
            </button>
          </div>
        )}
      </div>

      <a
        href="https://www.juso.go.kr/openEngPage.do"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 rounded-md border-2 border-sky-200 bg-sky-50/40 px-4 py-3 transition-colors hover:border-sky-400"
      >
        <span>
          <span className="block text-[13px] font-bold text-stone-900">
            도로명주소 영문 검색 (juso.go.kr)
          </span>
          <span className="block text-[11.5px] text-stone-600">
            공식 영문주소를 조회합니다. 서류에 쓸 최종 주소는 여기서 확인하세요.
          </span>
        </span>
        <ExternalLink className="h-4 w-4 flex-shrink-0 text-sky-600" />
      </a>

      <div className="rounded-md border border-stone-200 bg-stone-50 p-3 text-[11.5px] leading-relaxed text-stone-600">
        <strong className="text-stone-800">변환 규칙:</strong> 한국 주소는 큰 단위부터 적지만 영문
        주소는 작은 단위부터 적으므로 순서를 뒤집습니다. 도로 유형은 대로 daero, 로 ro, 길 gil로
        붙임표를 붙여 표기하고, 행정구역도 시 si, 군 gun, 구 gu, 읍 eup, 면 myeon, 동 dong, 리
        ri로 붙입니다. 붙임표 앞뒤에서는 음운 변화를 표기에 반영하지 않습니다.
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
        note="도로명주소 로마자 표기 규칙에 따른 표기입니다. 해외송금 등 표기가 정확히 일치해야 하는 서류는 도로명주소 안내시스템(juso.go.kr)의 영문 검색 결과로 확인하시기 바랍니다."
      />
    )}
    </>
  );
};
