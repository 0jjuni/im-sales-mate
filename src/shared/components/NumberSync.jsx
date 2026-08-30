import { cn } from "@shared/lib/format";

/* 슬라이더와 동기화되는 '직접 입력' 숫자 필드.
   슬라이더는 그대로 두고 바로 아래에 배치해, 바 이동/직접 입력 둘 다 가능하게 한다.
   값은 숫자, onChange(number)로 콜백. 범위를 벗어나면 min/max로 보정. */
const FOCUS = {
  amber: "focus:border-amber-500",
  fuchsia: "focus:border-fuchsia-500",
  violet: "focus:border-violet-500",
};

export function NumberSync({ value, onChange, min, max, step, accent = "amber", suffix }) {
  const clamp = (v) => Math.max(min, Math.min(max, v));
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full rounded-sm border border-slate-300 px-3 py-2 text-sm tabular-nums focus:outline-none",
          FOCUS[accent] ?? FOCUS.amber
        )}
      />
      {suffix && <span className="flex-shrink-0 text-xs text-slate-500">{suffix}</span>}
    </div>
  );
}
