import { AlertTriangle } from "lucide-react";

/* 계산기 디스클레이머 모달 */
export const CalculatorDisclaimer = ({ onAccept, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white max-w-md w-full rounded-md shadow-2xl border border-stone-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-5 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-stone-900">계산기 사용 안내</h3>
        </div>
        <p className="text-xs text-stone-500">
          본 계산기는 추정치를 제공하는 세일즈 보조 도구입니다.
        </p>
      </div>
      <div className="p-5 space-y-3">
        <div className="bg-amber-50/40 border-l-4 border-amber-400 p-3 text-sm text-stone-800 leading-relaxed space-y-1.5">
          <p>
            <strong>① 절세효과·환급금·비교 결과는 모두 추정치</strong>입니다. 실제 금액은 다른 소득공제 항목, 추가 소득, 시점에 따라 달라집니다.
          </p>
          <p>
            <strong>② 기준이율·부가지급률은 매 분기 변동</strong>됩니다. 정확한 공제금·해약환급금은 중앙회 시스템 조회 결과로 안내해 주세요.
          </p>
          <p>
            <strong>③ 종합소득세율은 매년 세법 개정</strong>에 따라 변경됩니다. (현재 2025년 기준)
          </p>
          <p>
            <strong>④ 정확한 절세효과는 세무 전문가 또는 국세청 상담</strong>을 권유해 주세요.
          </p>
        </div>
        <div className="text-xs text-stone-500">
          본 계산기 결과를 고객에게 단정적으로 안내하지 않으며, 자동 생성되는 안내 스크립트에는 디스클레이머가 함께 포함됩니다.
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
