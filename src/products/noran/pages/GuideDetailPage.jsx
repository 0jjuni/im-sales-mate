import { BookOpen, ArrowLeft, CheckCircle2, MessageCircle, FileText } from "lucide-react";
import { CATEGORIES } from "../data/categories";
import { ARTICLES } from "../data/articles";
import { SourceBadge } from "@shared/components/SourceBadge";
import { WarningBox } from "@shared/components/WarningBox";
import { CopyButton } from "@shared/components/CopyButton";

export const GuideDetailPage = ({ guide, onBack, onOpenArticle }) => {
  if (!guide) return null;
  const cat = CATEGORIES.find((c) => c.id === guide.category);

  return (
    <div className="space-y-8 max-w-5xl">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        가이드 목록으로
      </button>

      {/* 헤더 */}
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm">
            {cat?.name}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
          {guide.title}
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-loose">{guide.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 메인 컨텐츠 (좌측 2/3) */}
        <div className="lg:col-span-2 space-y-5">
          {/* 핵심 내용 */}
          <Section
            icon={CheckCircle2}
            title="핵심 내용"
            subtitle="상담 시 직원이 우선 확인할 내용"
            accent="amber"
          >
            <ul className="space-y-3">
              {guide.conditions.map((c, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[15px] text-slate-800 leading-loose whitespace-pre-line">
                    {c}
                  </span>
                </li>
              ))}
            </ul>
            {guide.restrictions && (
              <div className="mt-5 pt-5 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  제한 사항
                </h4>
                <ul className="space-y-2.5">
                  {guide.restrictions.map((r, i) => (
                    <li key={i} className="text-[15px] text-slate-700 leading-loose flex gap-2.5">
                      <span className="text-slate-400 flex-shrink-0 mt-1.5">·</span>
                      <span className="flex-1">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          {/* 고객 확인 질문 */}
          <Section
            icon={MessageCircle}
            title="고객 확인 질문"
            subtitle="고객에게 먼저 확인해야 할 질문"
            accent="blue"
          >
            <ol className="space-y-3">
              {guide.requiredQuestions.map((q, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0 mt-0.5">
                    Q{i + 1}
                  </span>
                  <span className="flex-1 text-[15px] text-slate-800 leading-loose">{q}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* 고객 안내 문구 — 영업 핵심 강조 */}
          <div className="bg-amber-50/50 border-2 border-amber-400 rounded-xl p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-2.5">
                <FileText className="w-5 h-5 text-amber-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">고객 안내 문구</h3>
                  <p className="text-xs text-slate-600 mt-0.5">상담 중 그대로 사용 가능한 표준 안내문</p>
                </div>
              </div>
              <CopyButton text={guide.customerScript} />
            </div>
            <p className="text-[15px] text-slate-800 leading-loose bg-white p-5 rounded-sm border border-amber-200/60">
              {guide.customerScript}
            </p>
          </div>
        </div>

        {/* 사이드 컨텐츠 (우측 1/3) */}
        <div className="space-y-4">
          <WarningBox items={guide.staffWarning} />

          {/* 관련 약관 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-200">
              <BookOpen className="w-4 h-4 text-slate-600" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                관련 약관·법령
              </h4>
            </div>
            <div className="space-y-1">
              {guide.sourceReference.articles.map((a) => (
                <button
                  key={a}
                  onClick={() => onOpenArticle(a)}
                  className="w-full text-left flex items-start gap-2 px-2.5 py-2 hover:bg-amber-50 rounded-sm group transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[13px] text-slate-700 group-hover:text-amber-700 leading-relaxed flex-1">
                    <strong className="font-bold">{a}</strong>{" "}
                    {ARTICLES[a]?.title && (
                      <span className="text-slate-500 group-hover:text-amber-600">
                        {ARTICLES[a].title}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
            {guide.sourceReference.keywords && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  키워드
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {guide.sourceReference.keywords.map((k) => (
                    <span
                      key={k}
                      className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* 본문 섹션 — IntroPage 패턴과 일관 */
const Section = ({ icon: Icon, title, subtitle, accent = "amber", children }) => {
  const palette = {
    amber: { bg: "bg-amber-100", text: "text-amber-700" },
    blue: { bg: "bg-blue-100", text: "text-blue-700" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  };
  const c = palette[accent] || palette.amber;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex items-start gap-3 mb-5 pb-4 border-b border-slate-100">
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-xl ${c.bg} flex-shrink-0`}
        >
          <Icon className={`w-4 h-4 ${c.text}`} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
