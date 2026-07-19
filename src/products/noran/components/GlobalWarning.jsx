import { AlertTriangle } from "lucide-react";

export const GlobalWarning = () => (
  <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 print:hidden">
    <div className="flex items-start gap-2.5">
      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-stone-800 leading-relaxed">
        <strong className="text-red-900">직원 안내 원칙:</strong> 공제금·해약환급금·대출한도·세금은 단정 안내를 피하고 중앙회 시스템 조회 결과로 안내해 주세요. 기준이율·부가지급률은 변동되며, 법령(조특법·중협법) 개정 사항도 수시 확인이 필요합니다.
      </p>
    </div>
  </div>
);
