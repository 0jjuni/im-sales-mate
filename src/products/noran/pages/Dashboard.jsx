import {
  ClipboardList,
  FileText,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Calculator,
  TrendingDown,
  Coins,
  Scale,
} from "lucide-react";
import { CATEGORIES } from "../data/categories";
import { GUIDES } from "../data/guides";
import { FAQS } from "../data/faqs";
import { SectionTitle } from "@shared/components/SectionTitle";
import { SourceBadge } from "@shared/components/SourceBadge";

export const Dashboard = ({ onNavigate, onOpenArticle }) => {
  const quickActions = [
    { id: "enrollment", label: "가입 상담", desc: "가입 대상·제한 업종·청약철회", icon: ClipboardList },
    { id: "claim", label: "공제금 청구", desc: "8가지 공제사유·지급기준·과세", icon: FileText },
    { id: "termination", label: "해약 / 환급금", desc: "임의·간주·강제 해약 안내", icon: AlertTriangle },
    { id: "loan", label: "공제계약 대출", desc: "한도·이자·기한이익 상실", icon: BookOpen },
  ];

  const topFaqs = FAQS.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-stone-500">약관 2026.7.1 + 조특법 법률 2025.7.1 / 시행령 2026.2.27 + 중협법 2026.6.3 시행</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">상담을 시작합니다</h1>
        <p className="text-sm text-stone-600 mt-1">고객 상황을 빠르게 분류하고 약관·법령 근거가 명확한 안내를 진행하세요.</p>
      </div>

      {/* 계산기 바로가기 */}
      <button
        onClick={() => onNavigate("calculator")}
        className="w-full text-left bg-stone-900 hover:bg-stone-800 transition-colors rounded-md p-5 group"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">세일즈 보조 계산기</h2>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3" /> 소득공제 절세효과
              </span>
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> 해약환급금 시나리오
              </span>
              <span className="flex items-center gap-1">
                <Scale className="w-3 h-3" /> 상품 비교
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 flex-shrink-0 text-stone-500 group-hover:text-amber-400 transition-colors" />
        </div>
      </button>

      <div>
        <SectionTitle sub="고객 상황에 맞는 상담 유형을 선택하세요">빠른 시작</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                onClick={() => onNavigate("simulator", `${qa.id}-1`)}
                className="group text-left p-5 bg-white border border-stone-200 hover:border-amber-400 hover:shadow-sm transition-all rounded-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-1 h-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon className="w-5 h-5 text-stone-600 group-hover:text-amber-600 transition-colors mb-3" />
                <div className="font-bold text-stone-900 text-base mb-1">{qa.label}</div>
                <div className="text-xs text-stone-500 leading-relaxed">{qa.desc}</div>
                <div className="mt-3 flex items-center text-xs text-amber-700 font-medium">
                  상담 시뮬레이터로 이동
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <SectionTitle>자주 묻는 질문 Top 5</SectionTitle>
          <button
            onClick={() => onNavigate("faq")}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
          >
            전체 FAQ <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white border border-stone-200 rounded-md divide-y divide-stone-100">
          {topFaqs.map((faq) => (
            <div key={faq.id} className="p-4 hover:bg-stone-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-stone-900 mb-1">{faq.question}</div>
                  <div className="text-sm text-stone-600 leading-relaxed">{faq.shortAnswer}</div>
                </div>
                <SourceBadge articles={faq.sourceReference.articles} onClick={onOpenArticle} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle sub="약관 8개 핵심 영역">업무별 가이드</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const count = GUIDES.filter((g) => g.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onNavigate("guide");
                }}
                className="p-3 bg-white border border-stone-200 hover:border-amber-400 transition-colors rounded-md text-left"
              >
                <div className="text-sm font-bold text-stone-900">{cat.name}</div>
                <div className="text-xs text-stone-500 mt-0.5">{count}개 가이드</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
