import { Link } from "react-router-dom";
import {
  Umbrella,
  PiggyBank,
  Landmark,
  Wallet,
  Shield,
  ArrowRight,
} from "lucide-react";
import { PRODUCTS } from "../data/products";
import { CARD_INTERACTIVE } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";

const ICONS = { Umbrella, PiggyBank, Landmark, Wallet, Shield };

/* 상품 아이덴티티 컬러 — Tailwind JIT가 스캔할 수 있도록 정적 클래스 문자열로 보관.
   (동적 문자열 조합 `bg-${x}-500` 은 purge에 잡히지 않으므로 사용하지 않는다) */
/* tint — 카드 배경에 얹는 모듈색 그라디언트(background-image라 흰 바탕과 충돌하지 않음).
   흰 카드 일변도를 피하되, 50 단계 + to-transparent로 아주 옅게만 둔다. */
const ACCENT = {
  amber: { grad: "from-amber-500 to-amber-600", text: "text-amber-700", hover: "hover:border-amber-300", tint: "bg-gradient-to-br from-amber-50 to-transparent" },
  emerald: { grad: "from-emerald-500 to-teal-600", text: "text-emerald-700", hover: "hover:border-emerald-300", tint: "bg-gradient-to-br from-emerald-50 to-transparent" },
  violet: { grad: "from-violet-500 to-purple-600", text: "text-violet-700", hover: "hover:border-violet-300", tint: "bg-gradient-to-br from-violet-50 to-transparent" },
  sky: { grad: "from-sky-500 to-blue-600", text: "text-sky-700", hover: "hover:border-sky-300", tint: "bg-gradient-to-br from-sky-50 to-transparent" },
};

/* 카드는 상품명·부제만 간결하게 — 세부 기능 나열은 desc 툴팁으로.
   활성 상품은 「상담 시작」, 미출시 상품은 옅게 + 「준비 중」 표기만. */
const ProductCard = ({ product }) => {
  const Icon = ICONS[product.icon] ?? Umbrella;
  const accent = ACCENT[product.accent] ?? ACCENT.sky;
  const active = product.status === "active";

  if (!active) {
    return (
      <div
        className="flex flex-col rounded-xl border border-slate-200/70 bg-slate-50/50 p-5"
        aria-disabled="true"
        title={product.desc}
      >
        <div className="flex items-start justify-between">
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${accent.grad} opacity-35 grayscale`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="whitespace-nowrap rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-400">
            준비 중
          </span>
        </div>
        <h3 className="mt-3.5 text-[15px] font-bold text-slate-400">{product.name}</h3>
        <p className="text-[11.5px] text-slate-400">{product.tagline}</p>
      </div>
    );
  }

  return (
    <Link
      to={product.to}
      title={product.desc}
      className={cn(CARD_INTERACTIVE, "flex flex-col p-5", accent.tint, accent.hover)}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${accent.grad} shadow-sm transition-transform group-hover:scale-105`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="mt-3.5 text-[15px] font-bold text-slate-900">{product.name}</h3>
      <p className="text-[11.5px] text-slate-500">{product.tagline}</p>
      <div className={`mt-4 flex items-center gap-1 text-[13px] font-semibold ${accent.text}`}>
        상담 시작
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
};

export function ProductGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
