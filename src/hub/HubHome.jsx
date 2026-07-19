import { LayoutGrid, Library } from "lucide-react";
import { HubShell } from "./HubShell";
import { useMorningBriefing } from "./hooks/useMorningBriefing";
import { MarketBoard } from "./components/MarketBoard";
import { MorningNews } from "./components/MorningNews";
import { ProductGrid } from "./components/ProductGrid";
import { KnowledgeLibrary } from "./components/KnowledgeLibrary";

const SectionHeader = ({ icon: Icon, title, sub }) => (
  <div className="mb-3 flex items-center gap-2.5">
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <h2 className="text-[15px] font-bold tracking-tight text-slate-900">{title}</h2>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  </div>
);

export function HubHome() {
  /* 마켓 보드와 뉴스 카드가 같은 브리핑 데이터를 공유 — fetch는 한 번만 */
  const { data, status, reload } = useMorningBriefing();

  return (
    <HubShell>
      {/* 상단: 마켓 보드(지표 스트립) + 오늘 아침 필수 뉴스 */}
      <div id="top" className="scroll-mt-4 space-y-4">
        <MarketBoard markets={data?.markets} status={status} />
        <MorningNews data={data} status={status} onReload={reload} />
      </div>

      {/* 중단: 상품 모듈 */}
      <section id="products" className="mt-8 scroll-mt-4">
        <SectionHeader
          icon={LayoutGrid}
          title="상품 모듈"
          sub="상담을 시작할 상품을 선택하세요"
        />
        <ProductGrid />
      </section>

      {/* 하단: PB 지식 라이브러리 */}
      <section id="knowledge" className="mt-8 scroll-mt-4">
        <SectionHeader
          icon={Library}
          title="PB 지식 라이브러리"
          sub="세무·규제·용어 — 상담 근거 자료"
        />
        <KnowledgeLibrary />
      </section>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-[11px] text-slate-400">
        내부 영업 지원 도구 (베타) · 시황 및 계산 결과는 참고용이며 투자권유가 아닙니다.
      </footer>
    </HubShell>
  );
}
