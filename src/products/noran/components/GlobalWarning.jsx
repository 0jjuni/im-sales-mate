import { AlertTriangle } from "lucide-react";

export const GlobalWarning = () => (
  <>
  <details className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700 sm:hidden print:hidden"><summary className="cursor-pointer font-semibold">상담 전 확인 · 계산 결과는 추정치입니다</summary><p className="mt-2 leading-relaxed">공제금·환급금·대출한도·세금은 중앙회 시스템 조회 결과로 안내해 주세요. 이율과 법령 개정 사항도 확인이 필요합니다.</p></details>
  <div className="hidden sm:block bg-red-50 border-b border-red-200 px-6 py-2.5 print:hidden">
    <div className="flex items-start gap-2.5">
      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-slate-800 leading-relaxed">
        <strong className="text-red-900">직원 안내 원칙:</strong> 공제금·해약환급금·대출한도·세금은 단정 안내를 피하고 중앙회 시스템 조회 결과로 안내해 주세요. 기준이율·부가지급률은 변동되며, 법령(조특법·중협법) 개정 사항도 수시 확인이 필요합니다.
      </p>
    </div>
  </div>
  </>
);
