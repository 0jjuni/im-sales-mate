import { useState } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, ThumbsUp, PenSquare, Check } from "lucide-react";
import { ME } from "@hub/followups/useFollowups";
import {
  REQUEST_STATUS,
  REQUEST_TOOLS,
  loadRequests,
  sortRequests,
  addRequest,
  setRequestVotes,
  loadVoted,
  saveVoted,
} from "../data/toolRequests";
import { cn } from "@shared/lib/format";

/* 보조 도구 요청 — 홈 대시보드에 임베드되는 게시판(별도 탭 아님).
   창구에서 이 사이트에 있으면 좋겠다 싶은 도구(계산기·변환기·안내/인쇄 도구 등)를
   바로 요청하고, 직원들이 공감(추천)으로 우선순위를 올린다. 상태 변경은 관리자 화면. */
export function ToolRequestBoard() {
  const [reqs, setReqs] = useState(loadRequests);
  const [voted, setVoted] = useState(loadVoted);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [writing, setWriting] = useState(false);
  const [filter, setFilter] = useState("active");
  const [message, setMessage] = useState("");

  const list = sortRequests(reqs).filter(r => filter === "mine" ? r.author === ME : filter === "done" ? r.status === "done" : r.status !== "done");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setReqs(addRequest({ title, detail, author: ME }));
    setTitle("");
    setDetail("");
    setWriting(false);
    setFilter("mine");
    setMessage("요청을 등록했습니다.");
  };

  const vote = (id, cur) => {
    const has = voted.has(id);
    const nextVoted = new Set(voted);
    has ? nextVoted.delete(id) : nextVoted.add(id);
    setVoted(nextVoted);
    saveVoted(nextVoted);
    setReqs(setRequestVotes(id, cur + (has ? -1 : 1)));
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" aria-label="요청 목록 필터">{[["active","진행 중"],["done","반영 완료"],["mine","내 요청"]].map(([key,label])=><button key={key} type="button" aria-pressed={filter===key} onClick={()=>setFilter(key)} className={cn("min-h-11 rounded-lg px-3 py-2 text-sm font-semibold",filter===key?"bg-im-50 text-im-800":"bg-slate-100 text-slate-600")}>{label} <span>{reqs.filter(r=>key==="mine"?r.author===ME:key==="done"?r.status==="done":r.status!=="done").length}</span></button>)}</div>
        <button type="button" aria-expanded={writing} onClick={()=>setWriting(!writing)} className="min-h-11 rounded-lg bg-im-600 px-4 py-2 text-sm font-bold text-white">{writing?"작성 닫기":"도구 요청하기"}</button>
      </div>
      <p role="status" className="text-sm text-im-700">{message}</p>
      {/* 요청 작성 */}
      {writing && <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-slate-600">
          <Lightbulb className="h-4 w-4 text-im-600" /> 새 요청
          <span className="font-normal text-slate-500">불편했던 업무를 알려주세요</span>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="어떤 업무가 불편하세요?"
          maxLength={100}
          placeholder="어떤 업무가 불편하세요?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px] font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:border-im-500 focus:outline-none"
        />
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={2}
          aria-label="현재 처리 방법과 불편한 점"
          maxLength={1500}
          placeholder="지금 어떻게 처리하고 있고, 무엇이 번거로운가요?"
          className="mt-2 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-[13px] leading-relaxed text-slate-700 placeholder:text-slate-300 focus:border-im-500 focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!title.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PenSquare className="h-3.5 w-3.5" /> 요청 등록
          </button>
        </div>
      </form>}

      {/* 요청 목록 */}
      <div className="mt-3 space-y-2.5">
        {!list.length && <p className="rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500">{filter === "mine" ? "아직 등록한 요청이 없습니다." : "해당하는 요청이 없습니다."}</p>}
        {list.map((r) => {
          const on = voted.has(r.id);
          const st = REQUEST_STATUS[r.status] || REQUEST_STATUS.review;
          return (
            <div key={r.id} className={cn("flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5", r.status === "done" && "opacity-80")}>
              <button
                onClick={() => vote(r.id, r.votes)}
                className={cn(
                  "flex w-12 flex-shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 transition-colors",
                  on ? "border-im-500 bg-im-50 text-im-700" : "border-slate-200 bg-white text-slate-500 hover:border-im-300 hover:text-im-700"
                )}
                aria-pressed={on}
                title="공감"
              >
                <ThumbsUp className={cn("h-4 w-4", on && "fill-im-500")} />
                <span className="text-[13px] font-bold tabular-nums">{r.votes}</span>
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold", st.cls)}>
                    {r.status === "done" && <Check className="h-3 w-3" />}
                    {st.label}
                  </span>
                  <h3 className="text-[13.5px] font-bold text-slate-900">{r.title}</h3>
                </div>
                {r.detail && <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{r.detail}</p>}
                <div className="mt-1.5 text-[11px] text-slate-400">요청 {r.author}</div>
                {r.reply && <div className="mt-3 rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold text-slate-600">담당자 답변</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{r.reply}</p></div>}
                {r.status === "done" && REQUEST_TOOLS.some(t=>t.path===r.toolPath) && <Link to={r.toolPath} className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-im-200 px-3 py-2 text-sm font-bold text-im-700">도구 사용하기 →</Link>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
