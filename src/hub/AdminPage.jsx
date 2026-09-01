import { useEffect, useMemo, useState } from "react";
import {
  Megaphone,
  Pin,
  AlertTriangle,
  Trash2,
  Pencil,
  Plus,
  X,
  RotateCcw,
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
import { cn } from "@shared/lib/format";

/* 부서 관리자 화면 — 담당 부서가 자기 상품의 공지를 직접 관리한다.
   데모라 인증 대신 「부서 선택」으로 담당 부서를 고른다(실배포 시 부서 SSO·권한으로 교체).
   저장은 브라우저 localStorage(이 브라우저 안에서만 유지). */

const EMPTY = { moduleId: "", title: "", body: "", level: "info", pinned: false };

export default function AdminPage() {
  const [deptId, setDeptId] = useState(DEPARTMENTS[0].id);
  const [notices, setNotices] = useState(() => loadNotices());
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const prev = document.title;
    document.title = "부서 공지 관리 · iM 세일즈메이트";
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
    setNotices(resetNotices());
    cancelEdit();
  };

  return (
    <HubShell>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-black leading-tight text-slate-900 md:text-xl">부서 공지 관리</h1>
            <p className="text-[11.5px] text-slate-500">담당 부서가 자기 상품의 공지를 직접 관리합니다</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-600 hover:border-slate-400"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          기본값 복원
        </button>
      </div>

      <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-slate-500">
        데모 화면입니다. 인증 대신 부서를 선택해 담당 부서를 지정하며, 저장 내용은 이 브라우저에만 유지됩니다.
        실배포 시에는 부서 계정(SSO)·권한과 백엔드 저장으로 교체됩니다.
      </p>

      {/* 부서 선택 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {DEPARTMENTS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptId(d.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
              d.id === deptId
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            )}
          >
            {d.name}
          </button>
        ))}
      </div>

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
    </HubShell>
  );
}
