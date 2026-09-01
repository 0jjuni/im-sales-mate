import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { getModule } from "@shared/data/departments";
import { FAQ_MODULES, loadFaqs, addFaq, updateFaq, removeFaq } from "@shared/data/faqs";
import { cn } from "@shared/lib/format";

/* 부서 FAQ 관리 — 담당 부서가 자기 상품의 FAQ를 추가·수정·삭제한다.
   AdminPage의 'FAQ' 모드에서 선택된 부서(dept)를 받아 그 부서의 FAQ 상품만 다룬다. */

const EMPTY = { moduleId: "", q: "", a: "", ref: "" };

export function FaqManager({ dept }) {
  const faqModules = dept.modules.filter((m) => FAQ_MODULES.includes(m));
  const [faqs, setFaqs] = useState(() => loadFaqs());
  const [form, setForm] = useState({ ...EMPTY, moduleId: faqModules[0] ?? "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setForm({ ...EMPTY, moduleId: faqModules[0] ?? "" });
    setEditingId(null);
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

  const startEdit = (f) => {
    setEditingId(f.id);
    setForm({ moduleId: f.moduleId, q: f.q, a: f.a, ref: f.ref || "" });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY, moduleId: faqModules[0] ?? "" });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (editingId) {
      setFaqs(updateFaq(editingId, { moduleId: form.moduleId, q: form.q.trim(), a: form.a.trim(), ref: form.ref.trim() }));
    } else {
      setFaqs(addFaq(form));
    }
    cancelEdit();
  };

  const onDelete = (id) => {
    setFaqs(removeFaq(id));
    if (editingId === id) cancelEdit();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      {/* 작성/수정 폼 */}
      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          {editingId ? <Pencil className="h-4 w-4 text-slate-500" /> : <Plus className="h-4 w-4 text-slate-500" />}
          <h3 className="text-[14px] font-bold text-slate-900">{editingId ? "FAQ 수정" : "새 FAQ 작성"}</h3>
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
          {faqModules.map((m) => (
            <option key={m} value={m}>{getModule(m)?.label ?? m}</option>
          ))}
        </select>

        <label className="mb-1 block text-[12px] font-semibold text-slate-600">질문</label>
        <input
          value={form.q}
          onChange={(e) => setForm((f) => ({ ...f, q: e.target.value }))}
          placeholder="고객이 자주 묻는 질문"
          className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-im-500 focus:outline-none"
        />

        <label className="mb-1 block text-[12px] font-semibold text-slate-600">답변</label>
        <textarea
          value={form.a}
          onChange={(e) => setForm((f) => ({ ...f, a: e.target.value }))}
          placeholder="직원이 안내할 답변"
          rows={4}
          className="mb-3 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-[13px] leading-relaxed focus:border-im-500 focus:outline-none"
        />

        <label className="mb-1 block text-[12px] font-semibold text-slate-600">근거 <span className="font-normal text-slate-400">(선택 · 법령/조항 등)</span></label>
        <input
          value={form.ref}
          onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))}
          placeholder="예: 조특법 제91조의18"
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-im-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-1.5 rounded-md bg-im-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {editingId ? "수정 저장" : "FAQ 등록"}
        </button>
      </form>

      {/* 목록 */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-[14px] font-bold text-slate-900">{dept.name} FAQ</h3>
          <span className="text-[11.5px] tabular-nums text-slate-400">{list.length}건</span>
        </div>
        {list.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12.5px] text-slate-400">
            등록된 FAQ가 없습니다. 왼쪽에서 새 FAQ를 작성하세요.
          </p>
        ) : (
          <ul className="space-y-2">
            {list.map((f) => (
              <li
                key={f.id}
                className={cn(
                  "rounded-lg border bg-white p-3",
                  editingId === f.id ? "border-im-400 ring-1 ring-im-200" : "border-slate-200"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-bold text-slate-900">{f.q}</h4>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{f.a}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                      <span>{getModule(f.moduleId)?.label ?? f.moduleId}</span>
                      {f.ref && (
                        <>
                          <span>·</span>
                          <span>{f.ref}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button onClick={() => startEdit(f)} title="수정" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onDelete(f.id)} title="삭제" className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
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
  );
}
