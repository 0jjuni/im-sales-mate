import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { TaxCreditCalculator } from "./TaxCreditCalculator";

/* 연금계좌 계산기 페이지 — 디스클레이머 게이트 후 세액공제 계산기 표시.
   현재 계산기 1종이라 탭은 없다. 퇴직금 수령방식 비교·연금수령한도 계산기가
   추가되면 노란처럼 탭 컨테이너로 확장. */
const PensionDisclaimer = ({ onAccept, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="계산기 사용 안내"
        className="bg-white max-w-md w-full rounded-md shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-stone-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-bold text-stone-900">계산기 사용 안내</h3>
          </div>
          <p className="text-xs text-stone-500">
            본 계산기는 추정치를 제공하는 세일즈 보조 도구입니다.
          </p>
        </div>
        <div className="p-5 space-y-3">
          <div className="bg-violet-50/40 border-l-4 border-violet-400 p-3 text-sm text-stone-800 leading-relaxed space-y-1.5">
            <p>
              <strong>① 환급액은 추정치</strong>입니다. 실제 세액공제는 산출세액 범위 내에서
              적용되며, 다른 소득공제·세액공제 항목에 따라 달라집니다.
            </p>
            <p>
              <strong>② 중도해지 시 기타소득세 16.5%</strong>가 부과됩니다. 공제율 13.2%를
              적용받은 고객은 환급받은 금액보다 더 납부하게 될 수 있으므로 반드시 함께 안내해
              주세요.
            </p>
            <p>
              <strong>③ 세액공제 한도·공제율은 세법 개정</strong>으로 변경될 수 있습니다. 현행
              소득세법과 자사 상품설명서를 병행 확인해 주세요.
            </p>
            <p>
              <strong>④ 데모 스캐폴드</strong> — 자사 연금저축·IRP 상품 조건 반영 전 단계입니다.
            </p>
          </div>
          <div className="text-xs text-stone-500">
            본 계산기 결과를 고객에게 단정적으로 안내하지 않으며, 자동 생성되는 안내 스크립트에는
            디스클레이머가 함께 포함됩니다.
          </div>
        </div>
        <div className="p-4 border-t border-stone-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-stone-300 bg-white hover:bg-stone-50 rounded-sm"
          >
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
};

export const CalculatorPage = () => {
  const [accepted, setAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            IRP 세액공제 계산기
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            "연말정산 때 얼마나 돌려받나요?"에 숫자로 답하고, IRP 권유 포인트를 함께 제시합니다.
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

      <div className="bg-violet-50/60 border-l-4 border-violet-500 px-4 py-2.5 rounded-r-sm flex items-start gap-2 print:hidden">
        <AlertTriangle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-stone-800 leading-relaxed">
          연금저축과 IRP는 세액공제 한도를 <strong>공유</strong>합니다 — 연금저축 단독 600만원, 두
          계좌 합산 900만원. <strong>타사 연금저축 납입액을 먼저 확인</strong>해야 IRP로 받을 수
          있는 공제 여지가 나옵니다.
        </p>
      </div>

      {accepted ? (
        <TaxCreditCalculator />
      ) : (
        <div className="border-2 border-dashed border-stone-300 rounded-md p-8 text-center print:hidden">
          <p className="text-sm text-stone-500">
            계산기는 사용 안내 확인 후 이용할 수 있습니다.
          </p>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="mt-3 px-4 py-2 text-sm bg-stone-900 text-white hover:bg-stone-800 rounded-sm font-semibold"
          >
            사용 안내 보기
          </button>
        </div>
      )}

      {!accepted && showDisclaimer && (
        <PensionDisclaimer
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
