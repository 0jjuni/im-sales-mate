import { useState } from "react";
import { ThumbsUp, Trash2, Lightbulb } from "lucide-react";
import {
  REQUEST_STATUS,
  STATUS_ORDER,
  loadRequests,
  sortRequests,
  setRequestStatus,
  removeRequest,
} from "@utility/data/toolRequests";
import { cn } from "@shared/lib/format";

/* 도구 요청 관리 — 관리자가 상태(검토중·개발중·반영완료)를 바꾸고, 필요 시 삭제한다.
   보조 도구는 특정 부서 소유가 아니라, 도구 담당 관점의 전역 관리 화면으로 둔다. */
export function ToolRequestManager() {
  const [reqs, setReqs] = useState(loadRequests);
  const list = sortRequests(reqs);

  const changeStatus = (id, status) => setReqs(setRequestStatus(id, status));
  const onDelete = (id) => {
    if (!window.confirm("이 요청을 삭제할까요?")) return;
    setReqs(removeRequest(id));
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5 text-[13px] text-slate-500">
        <Lightbulb className="h-4 w-4 text-sky-600" />
        도구 요청 <span className="font-bold text-slate-900 tabular-nums">{list.length}</span>건 · 상태를 바꿔 진행 상황을 알려 주세요
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-14 text-center text-[13px] text-slate-400">
          등록된 도구 요청이 없습니다.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {list.map((r) => {
            const st = REQUEST_STATUS[r.status] || REQUEST_STATUS.review;
            return (
              <li key={r.id} className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 last:border-b-0">
                <span className="mt-0.5 inline-flex w-11 flex-shrink-0 flex-col items-center rounded-md bg-slate-50 py-1 text-slate-500">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-[12px] font-bold tabular-nums">{r.votes}</span>
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", st.cls)}>{st.label}</span>
                    <h4 className="text-[13.5px] font-bold text-slate-900">{r.title}</h4>
                  </div>
                  {r.detail && <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{r.detail}</p>}
                  <div className="mt-1.5 text-[11px] text-slate-400">요청 {r.author}</div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <select
                    value={r.status}
                    onChange={(e) => changeStatus(r.id, e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[12px] font-semibold text-slate-700 focus:border-im-500 focus:outline-none"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {REQUEST_STATUS[s].label}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => onDelete(r.id)} title="삭제" className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
