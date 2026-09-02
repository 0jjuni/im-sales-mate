import { useEffect, useRef, useState } from "react";
import {
  Pin,
  AlertTriangle,
  Trash2,
  Pencil,
  PenSquare,
  ArrowLeft,
  Paperclip,
  X,
  FileText,
} from "lucide-react";
import { getModule } from "@shared/data/departments";
import { loadNotices, addNotice, updateNotice, removeNotice } from "@shared/data/notices";
import { cn } from "@shared/lib/format";

/* 부서 공지 관리 — 진짜 게시판 흐름.
   목록(list)에서 「글쓰기」로 전체 화면 작성기(write)에 들어가 제목·내용·첨부파일을 쓴다.
   ※ 데모: 첨부파일은 파일명·용량만 기록(실제 업로드는 백엔드 연동 단계). */

const EMPTY = { moduleId: "", title: "", body: "", level: "info", pinned: false, attachments: [] };

const fmtSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export function NoticeManager({ dept }) {
  const [notices, setNotices] = useState(() => loadNotices());
  const [view, setView] = useState("list"); // list | write
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY, moduleId: dept.modules[0] });
  const fileRef = useRef(null);

  /* 부서를 바꾸면 목록으로 돌아간다 */
  useEffect(() => {
    setView("list");
    setEditingId(null);
    setForm({ ...EMPTY, moduleId: dept.modules[0] });
  }, [dept.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const deptNotices = notices.filter((n) => dept.modules.includes(n.moduleId));

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY, moduleId: dept.modules[0] });
    setView("write");
  };
  const openEdit = (n) => {
    setEditingId(n.id);
    setForm({
      moduleId: n.moduleId,
      title: n.title,
      body: n.body,
      level: n.level,
      pinned: n.pinned,
      attachments: n.attachments || [],
    });
    setView("write");
  };
  const backToList = () => {
    setView("list");
    setEditingId(null);
  };

  const onFiles = (e) => {
    const picked = Array.from(e.target.files || []).map((f) => ({ name: f.name, size: f.size }));
    setForm((f) => ({ ...f, attachments: [...f.attachments, ...picked] }));
    if (fileRef.current) fileRef.current.value = "";
  };
  const removeAttachment = (i) =>
    setForm((f) => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }));

  const canSubmit = form.moduleId && form.title.trim() && form.body.trim();

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (editingId) {
      setNotices(
        updateNotice(editingId, {
          moduleId: form.moduleId,
          title: form.title.trim(),
          body: form.body.trim(),
          level: form.level,
          pinned: form.pinned,
          attachments: form.attachments,
        })
      );
    } else {
      setNotices(addNotice(form));
    }
    backToList();
  };

  const onDelete = (id) => {
    if (!window.confirm("이 공지를 삭제할까요?")) return;
    setNotices(removeNotice(id));
  };

  /* ── 작성/수정 화면 ── */
  if (view === "write") {
    return (
      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <button type="button" onClick={backToList} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            목록
          </button>
          <span className="text-[13px] font-bold text-slate-900">{editingId ? "공지 수정" : "새 공지 작성"}</span>
          <span className="w-12" />
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-[12.5px] font-semibold text-slate-600">상품</label>
            <select
              value={form.moduleId}
              onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-[13px] focus:border-im-500 focus:outline-none"
            >
              {dept.modules.map((m) => (
                <option key={m} value={m}>{getModule(m)?.label ?? m}</option>
              ))}
            </select>
          </div>

          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="제목을 입력하세요"
            className="w-full border-0 border-b border-slate-200 px-0 py-2 text-[18px] font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:border-im-500 focus:outline-none focus:ring-0"
          />

          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="창구 직원에게 전달할 내용을 자유롭게 작성하세요."
            className="min-h-[340px] w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-[14px] leading-relaxed text-slate-800 focus:border-im-500 focus:outline-none"
          />

          {/* 첨부파일 */}
          <div className="rounded-lg border border-dashed border-slate-300 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600">
                <Paperclip className="h-3.5 w-3.5" /> 첨부파일
              </span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-slate-600 hover:border-slate-400"
              >
                파일 선택
              </button>
              <input ref={fileRef} type="file" multiple onChange={onFiles} className="hidden" />
            </div>
            {form.attachments.length > 0 ? (
              <ul className="mt-2.5 space-y-1.5">
                {form.attachments.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-[12px]">
                    <FileText className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate text-slate-700">{a.name}</span>
                    <span className="flex-shrink-0 tabular-nums text-slate-400">{fmtSize(a.size)}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="flex-shrink-0 rounded p-0.5 text-slate-400 hover:text-rose-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[11.5px] text-slate-400">여러 파일을 첨부할 수 있습니다.</p>
            )}
          </div>

          {/* 옵션 */}
          <div className="flex flex-wrap items-center gap-5 border-t border-slate-100 pt-3">
            <label className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-700">
              <input
                type="checkbox"
                checked={form.level === "important"}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.checked ? "important" : "info" }))}
                className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
              />
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> 중요 공지
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
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={backToList} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 hover:border-slate-400">
            취소
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editingId ? "수정 저장" : "등록"}
          </button>
        </div>
      </form>
    );
  }

  /* ── 목록(게시판) 화면 ── */
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13px] text-slate-500">
          <span className="font-bold text-slate-900">{dept.name}</span> 공지 <span className="tabular-nums">{deptNotices.length}</span>건
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-md bg-im-600 px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700"
        >
          <PenSquare className="h-4 w-4" />
          글쓰기
        </button>
      </div>

      {deptNotices.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-14 text-center text-[13px] text-slate-400">
          등록된 공지가 없습니다. 「글쓰기」로 첫 공지를 작성하세요.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {deptNotices.map((n) => (
            <li key={n.id} className="flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50">
              <button onClick={() => openEdit(n)} className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {n.pinned && (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                      <Pin className="h-3 w-3" /> 고정
                    </span>
                  )}
                  {n.level === "important" && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      <AlertTriangle className="h-3 w-3" /> 중요
                    </span>
                  )}
                  <span className="text-[13.5px] font-bold text-slate-900">{n.title}</span>
                  {n.attachments?.length > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400">
                      <Paperclip className="h-3 w-3" />{n.attachments.length}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>{getModule(n.moduleId)?.label ?? n.moduleId}</span>
                  <span>·</span>
                  <span className="tabular-nums">{n.date}</span>
                </div>
              </button>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button onClick={() => openEdit(n)} title="수정" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDelete(n.id)} title="삭제" className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
