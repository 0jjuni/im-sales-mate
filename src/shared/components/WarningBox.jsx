import { AlertTriangle } from "lucide-react";
import { cn } from "@shared/lib/format";

export const WarningBox = ({ items, title = "직원 주의사항", compact = false }) => (
  <div
    className={cn(
      "border-l-4 border-red-500 bg-red-50/50 rounded-r-md",
      compact ? "p-3" : "p-4"
    )}
  >
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="w-4 h-4 text-red-600" />
      <h4 className="font-bold text-sm text-red-900">{title}</h4>
    </div>
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-stone-800 leading-relaxed pl-1">
          <span className="text-red-500 mr-1.5">•</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);
