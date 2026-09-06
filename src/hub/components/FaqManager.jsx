import { useEffect, useState } from "react";
import { Pencil, Trash2, PenSquare, ArrowLeft } from "lucide-react";
import { getModule } from "@shared/data/departments";
import { FAQ_MODULES, loadFaqs, addFaq, updateFaq, removeFaq } from "@shared/data/faqs";

/* 부서 FAQ 관리 — 공지사항과 같은 게시판 흐름.
   목록(list)에서 「글쓰기」로 전체 화면 작성기(write)에 들어가 질문·답변·근거를 쓴다.
   AdminPage의 'FAQ' 모드에서 선택된 부서(dept)의 FAQ 상품만 다룬다. */

const EMPTY = { moduleId: "", q: "", a: "", ref: "" };

export function FaqManager({ dept }) {
  const faqModules = dept.modules.filter((m) => FAQ_MODULES.includes(m));
  const [faqs, setFaqs] = useState(() => loadFaqs());
  const [view, setView] = useState("list"); // list | write
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY, moduleId: faqModules[0] ?? "" });

  /* 부서를 바꾸면 목록으로 */
  useEffect(() => {
    setView("list");
    setEditingId(null);
    setForm({ ...EMPTY, moduleId: faqModules[0] ?? "" });
  }, [dept.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (faqModules.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-[13px] text-slate-400">
        이 부서는 FAQ를 제공하는 상품이 없습니다.
      </p>
    );
  }

  const list = faqs.filter((f) => faqModules.includes(f.moduleId));
  const canSubmit = form.moduleId && form.q.trim() && form.a.trim();

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY, moduleId: faqModules[0] ?? "" });
    setView("write");
  };
  const openEdit = (f) => {
    setEditingId(f.id);
    setForm({ moduleId: f.moduleId, q: f.q, a: f.a, ref: f.ref || "" });
    setView("write");
  };
  const backToList = () => {
    setView("list");
    setEditingId(null);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (editingId) {
      setFaqs(updateFaq(editingId, { moduleId: form.moduleId, q: form.q.trim(), a: form.a.trim(), ref: form.ref.trim() }));
    } else {
      setFaqs(addFaq(form));
    }
    backToList();
  };

  const onDelete = (id) => {
    if (!window.confirm("이 FAQ를 삭제할까요?")) return;
    setFaqs(removeFaq(id));
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
          <span className="text-[13px] font-bold text-slate-900">{editingId ? "FAQ 수정" : "새 FAQ 작성"}</span>
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
              {faqModules.map((m) => (
                <option key={m} value={m}>{getModule(m)?.label ?? m}</option>
              ))}
            </select>
          </div>

          <input
            value={form.q}
            onChange={(e) => setForm((f) => ({ ...f, q: e.target.value }))}
            placeholder="고객이 자주 묻는 질문"
            className="w-full border-0 border-b border-slate-200 px-0 py-2 text-[18px] font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:border-im-500 focus:outline-none focus:ring-0"
          />

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-slate-600">답변</label>
            <textarea
              value={form.a}
              onChange={(e) => setForm((f) => ({ ...f, a: e.target.value }))}
              placeholder="직원이 안내할 답변을 작성하세요."
              className="min-h-[220px] w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-[14px] leading-relaxed text-slate-800 focus:border-im-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-slate-600">
              근거 <span className="font-normal text-slate-400">(선택 · 법령/조항 등)</span>
            </label>
            <input
              value={form.ref}
              onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))}
              placeholder="예: 조특법 제91조의18"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-im-500 focus:outline-none"
            />
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

  /* ── 목록 화면 ── */
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13px] text-slate-500">
          <span className="font-bold text-slate-900">{dept.name}</span> FAQ <span className="tabular-nums">{list.length}</span>건
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-md bg-im-600 px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700"
        >
          <PenSquare className="h-4 w-4" />
          글쓰기
        </button>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-14 text-center text-[13px] text-slate-400">
          등록된 FAQ가 없습니다. 「글쓰기」로 첫 FAQ를 작성하세요.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {list.map((f) => (
            <li key={f.id} className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 last:border-b-0 hover:bg-slate-50">
              <button onClick={() => openEdit(f)} className="min-w-0 flex-1 text-left">
                <h4 className="text-[13.5px] font-bold text-slate-900">{f.q}</h4>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600">{f.a}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                  <span>{getModule(f.moduleId)?.label ?? f.moduleId}</span>
                  {f.ref && (
                    <>
                      <span>·</span>
                      <span>{f.ref}</span>
                    </>
                  )}
                </div>
              </button>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button onClick={() => openEdit(f)} title="수정" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDelete(f.id)} title="삭제" className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
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
