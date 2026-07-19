import { Link } from "react-router-dom";
import {
  Umbrella,
  PiggyBank,
  Landmark,
  Wallet,
  ArrowRight,
  Lock,
} from "lucide-react";
import { PRODUCTS } from "../data/products";

const ICONS = { Umbrella, PiggyBank, Landmark, Wallet };

/* 상품 아이덴티티 컬러 — Tailwind JIT가 스캔할 수 있도록 정적 클래스 문자열로 보관.
   (동적 문자열 조합 `bg-${x}-500` 은 purge에 잡히지 않으므로 사용하지 않는다) */
const ACCENT = {
  amber: { grad: "from-amber-400 to-yellow-500", text: "text-amber-700", hover: "hover:border-amber-300" },
  emerald: { grad: "from-emerald-400 to-teal-500", text: "text-emerald-700", hover: "hover:border-emerald-300" },
  violet: { grad: "from-violet-400 to-purple-500", text: "text-violet-700", hover: "hover:border-violet-300" },
  sky: { grad: "from-sky-400 to-blue-500", text: "text-sky-700", hover: "hover:border-sky-300" },
};

const ProductCard = ({ product }) => {
  const Icon = ICONS[product.icon] ?? Umbrella;
  const accent = ACCENT[product.accent] ?? ACCENT.sky;
  const active = product.status === "active";

  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br ${accent.grad} shadow-sm ${active ? "" : "opacity-40 grayscale"}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        {active ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            이용 가능
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
            <Lock className="h-2.5 w-2.5" />
            준비 중
          </span>
        )}
      </div>

      <h3 className={`mt-3.5 text-[15px] font-bold ${active ? "text-slate-900" : "text-slate-400"}`}>
        {product.name}
      </h3>
      <p className={`text-[11px] font-medium ${active ? "text-slate-500" : "text-slate-400"}`}>
        {product.tagline}
      </p>
      <p className={`mt-1.5 flex-1 text-[12px] leading-relaxed ${active ? "text-slate-500" : "text-slate-400"}`}>
        {product.desc}
      </p>

      {active ? (
        <div className={`mt-3 flex items-center gap-1 text-[13px] font-semibold ${accent.text}`}>
          모듈 열기
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      ) : (
        <div className="mt-3 text-[12px] font-medium text-slate-400">출시 예정</div>
      )}
    </>
  );

  const base =
    "group flex flex-col rounded-lg border bg-white p-4 transition-all";

  return active ? (
    <Link
      to={product.to}
      className={`${base} border-slate-200 ${accent.hover} hover:shadow-sm`}
    >
      {inner}
    </Link>
  ) : (
    <div className={`${base} cursor-not-allowed border-slate-200/70 bg-slate-50/50`} aria-disabled="true">
      {inner}
    </div>
  );
};

export function ProductGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
