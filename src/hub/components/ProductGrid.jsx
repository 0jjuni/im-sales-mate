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

/* 상품 아이덴티티 컬러 — Tailwind JIT가 스캔하도록 정적 클래스 문자열로 보관.
   프로페셔널 톤: 채도 높은 그라디언트 대신 옅은 틴트 배경 + 같은 색 플랫 아이콘.
   색은 '식별'용으로만 쓰고 장식을 줄인다. */
const ACCENT = {
  amber: { text: "text-amber-700", hover: "hover:border-amber-300", icon: "bg-amber-50 text-amber-700" },
  fuchsia: { text: "text-fuchsia-700", hover: "hover:border-fuchsia-300", icon: "bg-fuchsia-50 text-fuchsia-700" },
  violet: { text: "text-violet-700", hover: "hover:border-violet-300", icon: "bg-violet-50 text-violet-700" },
  sky: { text: "text-sky-700", hover: "hover:border-sky-300", icon: "bg-sky-50 text-sky-700" },
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Icon className="h-5 w-5" />
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
      className={cn(CARD_INTERACTIVE, "flex flex-col p-5", accent.hover)}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          accent.icon
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3.5 text-[15px] font-bold text-slate-900">{product.name}</h3>
      <p className="text-[11.5px] text-slate-500">{product.tagline}</p>
      <div className={cn("mt-4 flex items-center gap-1 text-[13px] font-semibold", accent.text)}>
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
