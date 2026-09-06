import { useState, useRef } from "react";
import { CreditCard, PenSquare, ArrowLeft, Pencil, Trash2, ImagePlus, X, Plus } from "lucide-react";
import {
  SEGMENTS,
  CARD_TYPES,
  typeLabel,
  loadCustomCards,
  addCustomCard,
  updateCustomCard,
  removeCustomCard,
} from "@card/data/cards";
import { cn } from "@shared/lib/format";

/* 카드사업부 카드 관리 — 공지·FAQ와 같은 게시판 흐름.
   목록에서 「카드 추가」로 작성 화면에 들어가 카드명·이미지·혜택·eBiz 링크를 등록한다.
   등록한 카드는 카드 탐색·상세·가입 QR에 그대로 반영된다(localStorage, 데모). */

const EMPTY = {
  name: "",
  segment: "personal",
  type: "credit",
  image: "",
  blurb: "",
  benefits: [{ label: "", value: "" }],
  annualFee: "",
};

const segLabel = (id) => SEGMENTS.find((s) => s.id === id)?.label ?? id;

const Thumb = ({ src }) => {
  if (src) return <img src={src} alt="" className="h-[64px] w-[50px] flex-shrink-0 rounded-md object-contain" />;
  return (
    <div className="flex h-[64px] w-[50px] flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-300">
      <CreditCard className="h-5 w-5" />
    </div>
  );
};

export function CardManager() {
  const [cards, setCards] = useState(() => loadCustomCards());
  const [view, setView] = useState("list"); // list | write
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const fileRef = useRef(null);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY, benefits: [{ label: "", value: "" }] });
    setView("write");
  };
  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      segment: c.segment,
      type: c.type,
      image: c.image || "",
      blurb: c.blurb || "",
      benefits: c.benefits?.length ? c.benefits.map((b) => ({ ...b })) : [{ label: "", value: "" }],
      annualFee: c.annualFee || "",
    });
    setView("write");
  };
  const backToList = () => {
    setView("list");
    setEditingId(null);
  };

  const onPickImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setForm((s) => ({ ...s, image: r.result }));
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const setBenefit = (i, key, val) =>
    setForm((s) => ({ ...s, benefits: s.benefits.map((b, j) => (j === i ? { ...b, [key]: val } : b)) }));
  const addBenefit = () =>
    setForm((s) => (s.benefits.length >= 3 ? s : { ...s, benefits: [...s.benefits, { label: "", value: "" }] }));
  const removeBenefit = (i) => setForm((s) => ({ ...s, benefits: s.benefits.filter((_, j) => j !== i) }));

  const canSubmit = form.name.trim();

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (editingId) setCards(updateCustomCard(editingId, form));
    else {
      addCustomCard(form);
      setCards(loadCustomCards());
    }
    backToList();
  };

  const onDelete = (id) => {
    if (!window.confirm("이 카드를 삭제할까요?")) return;
    setCards(removeCustomCard(id));
  };

  /* ── 작성/수정 화면 ── */
  if (view === "write") {
    return (
      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <button type="button" onClick={backToList} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> 목록
          </button>
          <span className="text-[13px] font-bold text-slate-900">{editingId ? "카드 수정" : "새 카드 등록"}</span>
          <span className="w-12" />
        </div>

        <div className="space-y-5 px-5 py-5">
          {/* 이미지 + 이름 */}
          <div className="flex items-start gap-4">
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "flex h-[92px] w-[72px] flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border transition-colors",
                  form.image ? "border-slate-300" : "border-dashed border-slate-300 text-slate-400 hover:border-rose-400 hover:text-rose-500"
                )}
              >
                {form.image ? (
                  <img src={form.image} alt="" className="h-full w-full object-contain" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px] font-semibold">이미지</span>
                  </>
                )}
              </button>
              {form.image && (
                <button type="button" onClick={() => setForm((s) => ({ ...s, image: "" }))} className="mt-1 block text-[11px] text-slate-400 hover:text-rose-600">
                  이미지 제거
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
            </div>

            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-[12px] font-semibold text-slate-600">카드명</label>
              <input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="예: iM 라이프 플러스 카드"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px] font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:border-rose-500 focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-4">
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-slate-600">대상</label>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {SEGMENTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, segment: s.id }))}
                        className={cn(
                          "rounded-md px-3 py-1 text-[12px] font-bold transition-colors",
                          form.segment === s.id ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-semibold text-slate-600">종류</label>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {CARD_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                        className={cn(
                          "rounded-md px-3 py-1 text-[12px] font-bold transition-colors",
                          form.type === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-slate-600">한 줄 소개</label>
            <input
              value={form.blurb}
              onChange={(e) => setForm((s) => ({ ...s, blurb: e.target.value }))}
              placeholder="예: 생활 전 영역 최대 10% 할인"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* 대표 혜택 */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-slate-600">대표 혜택 <span className="font-normal text-slate-400">(선택 · 최대 3개)</span></label>
            <div className="space-y-2">
              {form.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={b.label}
                    onChange={(e) => setBenefit(i, "label", e.target.value)}
                    placeholder="구분 (예: 대중교통)"
                    className="w-40 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12.5px] focus:border-rose-500 focus:outline-none"
                  />
                  <input
                    value={b.value}
                    onChange={(e) => setBenefit(i, "value", e.target.value)}
                    placeholder="혜택 (예: 10% 할인)"
                    className="min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12.5px] focus:border-rose-500 focus:outline-none"
                  />
                  {form.benefits.length > 1 && (
                    <button type="button" onClick={() => removeBenefit(i)} className="rounded p-1 text-slate-400 hover:text-rose-600" aria-label="혜택 삭제">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {form.benefits.length < 3 && (
              <button type="button" onClick={addBenefit} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 hover:text-rose-700">
                <Plus className="h-3.5 w-3.5" /> 혜택 추가
              </button>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-slate-600">연회비 <span className="font-normal text-slate-400">(선택)</span></label>
            <input
              value={form.annualFee}
              onChange={(e) => setForm((s) => ({ ...s, annualFee: e.target.value }))}
              placeholder="예: 국내전용 10,000원 / 겸용 12,000원"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-rose-500 focus:outline-none"
            />
          </div>

          <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-slate-500">
            eBiz 가입 링크는 직원마다 다르므로 여기서 넣지 않습니다. 각 직원이 카드 상세의 「가입 링크 추가」에서 본인 링크를 등록하면 가입 QR이 활성화됩니다.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={backToList} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 hover:border-slate-400">
            취소
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-rose-600 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editingId ? "수정 저장" : "카드 등록"}
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
          카드사업부 <span className="font-bold text-slate-900">등록 카드</span> <span className="tabular-nums">{cards.length}</span>건
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-rose-700"
        >
          <PenSquare className="h-4 w-4" /> 카드 추가
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-14 text-center text-[13px] text-slate-400">
          등록한 카드가 없습니다. 「카드 추가」로 신상품 카드를 올리면 카드 탐색·상세에 바로 노출됩니다.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50">
              <Thumb src={c.image} />
              <button onClick={() => openEdit(c)} className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[13.5px] font-bold text-slate-900">{c.name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{segLabel(c.segment)}</span>
                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">{typeLabel(c.type)}</span>
                </div>
                {c.blurb && <p className="mt-0.5 truncate text-[12px] text-slate-500">{c.blurb}</p>}
              </button>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button onClick={() => openEdit(c)} title="수정" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDelete(c.id)} title="삭제" className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11.5px] leading-relaxed text-slate-400">
        기본 카탈로그(내장 카드)는 그대로 유지되며, 여기서 등록한 카드가 카드 탐색 목록 위쪽에 함께 노출됩니다.
      </p>
    </div>
  );
}
