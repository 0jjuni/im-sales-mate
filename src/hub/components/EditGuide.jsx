import { useEffect } from "react";
import { GripVertical, ArrowUpDown, EyeOff, RotateCcw, X } from "lucide-react";

/* 대시보드 편집 안내 — 편집 모드에 처음 들어갈 때 한 번 띄운다.
   본 적이 있으면 다시 띄우지 않고, 편집 바의 물음표 버튼으로 다시 열 수 있다. */

const SEEN_KEY = "salesbridge.editGuideSeen";

export const hasSeenEditGuide = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

export const markEditGuideSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* 저장 실패(시크릿 모드 등)는 무시 — 이번 세션에만 안 뜬다 */
  }
};

const STEPS = [
  {
    icon: ArrowUpDown,
    title: "순서 바꾸기",
    desc: "화살표 버튼을 누르거나 왼쪽 손잡이를 끌어 올리고 내립니다.",
  },
  {
    icon: EyeOff,
    title: "필요 없는 섹션 숨기기",
    desc: "쓰지 않는 섹션은 숨기면 화면에서 빠집니다. 언제든 다시 켤 수 있습니다.",
  },
  {
    icon: RotateCcw,
    title: "되돌리기",
    desc: "기본값 복원을 누르면 처음 상태로 돌아갑니다.",
  },
];

export const EditGuide = ({ onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="대시보드 편집 안내"
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">대시보드 편집</h3>
            <p className="mt-0.5 text-[12px] text-slate-500">
              창구마다 쓰는 기능이 다릅니다. 내 화면에 맞게 바꿔 두세요.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex-shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="space-y-3 p-5">
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-im-50 text-im-700">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-slate-900">{title}</div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <GripVertical className="h-3.5 w-3.5" />
            이 안내는 처음 한 번만 표시됩니다
          </span>
          <button
            onClick={onClose}
            className="rounded-md bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-slate-800"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};
