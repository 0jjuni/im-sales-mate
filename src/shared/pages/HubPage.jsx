import { Link } from "react-router-dom";
import { ArrowRight, Umbrella } from "lucide-react";

/* 임시 허브 페이지 — 세일즈브릿지의 상품 모듈 진입점.
   현재는 노란우산공제 1호 모듈만 연결. 이후 상품이 추가되면 카드가 늘어난다. */
const PRODUCTS = [
  {
    to: "/noran",
    name: "노란우산공제",
    desc: "소기업·소상공인 공제 상담 가이드 — 시뮬레이터·계산기·FAQ·체크리스트",
    icon: Umbrella,
    accent: "from-amber-400 to-yellow-500",
    active: true,
  },
];

export function HubPage() {
  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
    >
      <div className="max-w-4xl mx-auto px-5 py-12 md:py-20">
        <header className="mb-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
            SalesBridge
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-stone-900">
            세일즈브릿지
          </h1>
          <p className="mt-2 text-sm text-stone-500 leading-relaxed">
            PB·VM을 위한 상품 상담 허브 · 상품 모듈을 선택해 시작하세요.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCTS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.to}
                to={p.to}
                className="group relative flex flex-col rounded-lg border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm"
              >
                <div
                  className={`w-11 h-11 rounded-md bg-gradient-to-br ${p.accent} flex items-center justify-center shadow-sm`}
                >
                  <Icon className="w-6 h-6 text-stone-900" />
                </div>
                <h2 className="mt-4 text-base font-bold text-stone-900">
                  {p.name}
                </h2>
                <p className="mt-1 text-[13px] text-stone-500 leading-relaxed flex-1">
                  {p.desc}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-amber-700">
                  모듈 열기
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        <footer className="mt-12 text-[11px] text-stone-400">
          SalesBridge · 내부 영업 지원 도구 (베타)
        </footer>
      </div>
    </div>
  );
}
