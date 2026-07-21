import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { TaxCalculator } from "./TaxCalculator";

/* ISA 계산기 페이지 — 디스클레이머 게이트 후 세제 절세 계산기 표시.
   현재 계산기 1종(세제 절세)이라 탭은 없다. 도구가 늘면 노란처럼 탭 컨테이너로 확장. */
const IsaDisclaimer = ({ onAccept, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
    <div
      className="bg-white max-w-md w-full rounded-md shadow-2xl border border-stone-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-5 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-stone-900">계산기 사용 안내</h3>
        </div>
        <p className="text-xs text-stone-500">본 계산기는 추정치를 제공하는 세일즈 보조 도구입니다.</p>
      </div>
      <div className="p-5 space-y-3">
        <div className="bg-emerald-50/40 border-l-4 border-emerald-400 p-3 text-sm text-stone-800 leading-relaxed space-y-1.5">
          <p>
            <strong>① 절세효과는 모두 추정치</strong>입니다. 실제 세액은 계좌 내 상품 구성·운용성과·시점에 따라 달라집니다.
          </p>
          <p>
            <strong>② 비과세·분리과세 혜택은 의무가입기간 3년 충족 전제</strong>입니다. 중도해지 시 일반과세로 추징됩니다.
          </p>
          <p>
            <strong>③ 납입한도·비과세한도는 세법 개정으로 변경</strong>될 수 있습니다. 현행 조특법과 자사 상품설명서를 병행 확인해 주세요.
          </p>
          <p>
            <strong>④ 데모 스캐폴드</strong> — 자사 ISA 상품 조건·최신 개정 반영 전 단계입니다.
          </p>
        </div>
        <div className="text-xs text-stone-500">
          본 계산기 결과를 고객에게 단정적으로 안내하지 않으며, 자동 생성되는 안내 스크립트에는 디스클레이머가 함께 포함됩니다.
        </div>
      </div>
      <div className="p-4 border-t border-stone-200 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-stone-300 bg-white hover:bg-stone-50 rounded-sm">
          취소
        </button>
        <button
          onClick={onAccept}
          className="px-4 py-2 text-sm bg-stone-900 text-white hover:bg-stone-800 rounded-sm font-semibold"
        >
          이해했습니다 — 계산기 사용
        </button>
      </div>
    </div>
  </div>
);

export const CalculatorPage = () => {
  const [accepted, setAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between print:hidden">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">
            Calculator
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mt-1">
            ISA 세제 절세 계산기
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            ISA와 일반계좌의 세부담을 비교해 추정 절세액을 즉시 계산합니다.
          </p>
        </div>
        {!accepted && (
          <button
            onClick={() => setShowDisclaimer(true)}
            className="text-xs text-stone-600 hover:text-stone-900 underline"
          >
            사용 안내 다시 보기
          </button>
        )}
      </div>

      <div className="bg-emerald-50/60 border-l-4 border-emerald-500 px-4 py-2.5 rounded-r-sm flex items-start gap-2 print:hidden">
        <AlertTriangle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-800 leading-relaxed">
          본 계산기 결과는 모두 <strong>추정치</strong>입니다. 비과세·분리과세 혜택은 의무가입기간 3년 충족을 전제로 하며, 실제 세액은 상품 구성·세법 개정에 따라 달라집니다. 현행 조특법과 자사 ISA 상품설명서를 병행 확인해 주세요.
        </p>
      </div>

      {accepted && <TaxCalculator />}

      {!accepted && showDisclaimer && (
        <IsaDisclaimer
          onAccept={() => {
            setAccepted(true);
            setShowDisclaimer(false);
          }}
          onClose={() => setShowDisclaimer(false)}
        />
      )}
    </div>
  );
};
