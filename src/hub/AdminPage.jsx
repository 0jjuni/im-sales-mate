import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Megaphone,
  Pin,
  AlertTriangle,
  Trash2,
  Pencil,
  Plus,
  X,
  RotateCcw,
  HelpCircle,
  Building2,
  ChevronDown,
  Check,
} from "lucide-react";
import { HubShell } from "./HubShell";
import { DEPARTMENTS, getModule } from "@shared/data/departments";
import {
  loadNotices,
  addNotice,
  updateNotice,
  removeNotice,
  resetNotices,
} from "@shared/data/notices";
import { resetFaqs } from "@shared/data/faqs";
import { FaqManager } from "./components/FaqManager";
import { cn } from "@shared/lib/format";

/* 부서 관리자 화면 — 담당 부서가 자기 상품의 공지·FAQ를 직접 관리한다.
   데모라 인증 대신 「부서 선택」으로 담당 부서를 고른다(실배포 시 부서 SSO·권한으로 교체).
   저장은 브라우저 localStorage(이 브라우저 안에서만 유지). */

const EMPTY = { moduleId: "", title: "", body: "", level: "info", pinned: false };

const MODES = [
  { id: "notices", label: "공지사항", icon: Megaphone },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export default function AdminPage() {
  const [params] = useSearchParams();
  const [deptId, setDeptId] = useState(DEPARTMENTS[0].id);
  const [mode, setMode] = useState(params.get("mode") === "faq" ? "faq" : "notices");
  const [switchOpen, setSwitchOpen] = useState(false);
  const [notices, setNotices] = useState(() => loadNotices());
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const prev = document.title;
    document.title = "부서 관리자 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const dept = DEPARTMENTS.find((d) => d.id === deptId);

  /* 부서를 바꾸면 폼의 상품 기본값을 그 부서 첫 상품으로 맞춘다 */
  useEffect(() => {
    setForm((f) => ({ ...f, moduleId: dept?.modules[0] ?? "" }));
    setEditingId(null);
  }, [deptId]); // eslint-disable-line react-hooks/exhaustive-deps

  const deptNotices = useMemo(
    () => notices.filter((n) => dept?.modules.includes(n.moduleId)),
    [notices, dept]
  );

  const startEdit = (n) => {
    setEditingId(n.id);
    setForm({ moduleId: n.moduleId, title: n.title, body: n.body, level: n.level, pinned: n.pinned });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY, moduleId: dept?.modules[0] ?? "" });
  };

  const canSubmit = form.moduleId && form.title.trim() && form.body.trim();

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (editingId) {
      setNotices(updateNotice(editingId, {
        moduleId: form.moduleId,
        title: form.title.trim(),
        body: form.body.trim(),
        level: form.level,
        pinned: form.pinned,
      }));
    } else {
      setNotices(addNotice(form));
    }
    cancelEdit();
  };

  const onDelete = (id) => {
    setNotices(removeNotice(id));
    if (editingId === id) cancelEdit();
  };

  const onReset = () => {
    if (mode === "faq") {
      resetFaqs();
      window.location.reload();
      return;
    }
    setNotices(resetNotices());
    cancelEdit();
  };

  return (
    <HubShell>
      {/* 콘솔 헤더 — 담당자 계정으로 접속한 관리 화면 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[16px] font-black leading-tight text-slate-900 md:text-[17px]">공지·FAQ 관리자</h1>
            <p className="text-[11.5px] text-slate-500">담당 부서 계정으로 접속 중</p>
          </div>
        </div>

        {/* 접속 계정(부서) — 전환 가능 */}
        <div className="relative">
          <button
            onClick={() => setSwitchOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-slate-300"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-im-600 text-[12px] font-bold text-white">
              {dept?.manager?.[0] ?? "담"}
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[12.5px] font-bold text-slate-900">{dept?.manager ?? "담당자"}</span>
              <span className="block text-[11px] text-slate-500">{dept?.name}</span>
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", switchOpen && "rotate-180")} />
          </button>

          {switchOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setSwitchOpen(false)} />
              <div className="absolute right-0 top-full z-40 mt-1.5 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  관리 부서 전환
                </div>
                {DEPARTMENTS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDeptId(d.id);
                      setSwitchOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-slate-50",
                      d.id === deptId && "bg-im-50/60"
                    )}
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-200 text-[12px] font-bold text-slate-600">
                      {d.manager[0]}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[12.5px] font-semibold text-slate-900">{d.name}</span>
                      <span className="block text-[11px] text-slate-500">{d.manager}</span>
                    </span>
                    {d.id === deptId && <Check className="h-4 w-4 flex-shrink-0 text-im-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 공지사항 / FAQ 모드 */}
      <div className="mb-5 flex gap-1 border-b border-slate-200">
        {MODES.map((m) => {
          const Icon = m.icon;
          const on = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors",
                on ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {mode === "faq" ? (
        <FaqManager dept={dept} />
      ) : (
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* 작성/수정 폼 */}
        <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            {editingId ? <Pencil className="h-4 w-4 text-slate-500" /> : <Plus className="h-4 w-4 text-slate-500" />}
            <h2 className="text-[14px] font-bold text-slate-900">{editingId ? "공지 수정" : "새 공지 작성"}</h2>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" /> 취소
              </button>
            )}
          </div>

          <label className="mb-1 block text-[12px] font-semibold text-slate-600">상품</label>
          <select
            value={form.moduleId}
            onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-im-500 focus:outline-none"
          >
            {dept?.modules.map((m) => (
              <option key={m} value={m}>{getModule(m)?.label ?? m}</option>
            ))}
          </select>

          <label className="mb-1 block text-[12px] font-semibold text-slate-600">제목</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="공지 제목"
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-im-500 focus:outline-none"
          />

          <label className="mb-1 block text-[12px] font-semibold text-slate-600">내용</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="창구 직원에게 전달할 내용"
            rows={4}
            className="mb-3 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-[13px] leading-relaxed focus:border-im-500 focus:outline-none"
          />

          <div className="mb-4 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-700">
              <input
                type="checkbox"
                checked={form.level === "important"}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.checked ? "important" : "info" }))}
                className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
              />
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> 중요
            </label>
            <label className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-700">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
              />
              <Pin className="h-3.5 w-3.5 text-slate-500" /> 상단 고정
              <span className="text-[11px] font-normal text-slate-400">(공지 게시판 상단 고정)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editingId ? "수정 저장" : "공지 등록"}
          </button>
        </form>

        {/* 공지 목록 */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[14px] font-bold text-slate-900">{dept?.name} 공지</h2>
            <span className="text-[11.5px] tabular-nums text-slate-400">{deptNotices.length}건</span>
          </div>
          {deptNotices.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12.5px] text-slate-400">
              등록된 공지가 없습니다. 왼쪽에서 새 공지를 작성하세요.
            </p>
          ) : (
            <ul className="space-y-2">
              {deptNotices.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "rounded-lg border bg-white p-3",
                    editingId === n.id ? "border-im-400 ring-1 ring-im-200" : "border-slate-200"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {n.level === "important" && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="h-3 w-3" /> 중요
                          </span>
                        )}
                        {n.pinned && (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                            <Pin className="h-3 w-3" /> 고정
                          </span>
                        )}
                        <span className="text-[13px] font-bold text-slate-900">{n.title}</span>
                      </div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{n.body}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{getModule(n.moduleId)?.label ?? n.moduleId}</span>
                        <span>·</span>
                        <span className="tabular-nums">{n.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => startEdit(n)}
                        title="수정"
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(n.id)}
                        title="삭제"
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-400">
        <span>변경 사항은 저장 즉시 각 상품 화면에 반영됩니다.</span>
        <button onClick={onReset} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600">
          <RotateCcw className="h-3 w-3" />
          {mode === "faq" ? "FAQ" : "공지"} 기본값으로 초기화
        </button>
      </div>
    </HubShell>
  );
}
