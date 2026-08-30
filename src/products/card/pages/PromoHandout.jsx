import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { Printer, FileText, AlertTriangle, Sparkles } from "lucide-react";
import { QrSvg, buildQrPath } from "@utility/components/QrCode";
import { CARDS, findCard } from "../data/cards";
import { cn } from "@shared/lib/format";

/* 상품 가입 안내문 (eBiz 연동).

   창구에서 카드를 권유했는데 고객이 「지금 바쁘니 나중에 가입하겠다」며 나갈 때,
   문자 링크 대신 그 자리에서 종이로 건네는 안내문을 만든다.

   eBiz에서 만든 가입 링크(고객이 타고 들어가 가입하면 담당 직원 실적)와
   심의필 광고 문구를 붙여넣으면 — 링크는 QR로, 문구는 원문 그대로 실은
   A4 안내문을 인쇄한다. 카드 카탈로그에서 선택하면 자동으로 채워진다.

   심의필 문구는 광고 규제 대상이라 임의로 고치지 않고 붙여넣은 원문 그대로 출력한다. */

const parseAd = (text) => {
  const raw = (text || "").replace(/\r\n/g, "\n");
  if (!raw.trim()) return null;

  const urlMatch = raw.match(/https?:\/\/[^\s]+/);
  const url = urlMatch ? urlMatch[0].replace(/[)\]>.,、。]+$/, "") : "";

  let product = "";
  const pm = raw.match(/■\s*["“”'‘’]?\s*([^\n"“”'‘’]+?)\s*["“”'‘’]?\s*상품\s*가입/);
  if (pm) product = pm[1].trim();

  const markerIdx = raw.indexOf("■");
  const preamble =
    markerIdx > 0
      ? raw.slice(0, markerIdx).split("\n").map((s) => s.trim()).filter(Boolean)
      : [];
  const eyebrow = preamble[0] || "";
  const benefit = preamble.slice(1).join(" ");

  const approvals = raw.match(/\[[^\]]*심의필[^\]]*\]/g) || [];

  let body = "";
  const chk = raw.search(/\[?\s*반드시\s*확인/);
  if (chk >= 0) body = raw.slice(chk);
  else if (urlMatch) body = raw.slice(raw.indexOf(urlMatch[0]) + urlMatch[0].length);
  else body = raw;
  approvals.forEach((a) => {
    body = body.split(a).join("");
  });
  body = body.replace(/\n{3,}/g, "\n\n").trim();

  return { url, product, eyebrow, benefit, approvals, body };
};

const absoluteUrl = (u) => {
  const s = (u || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (typeof window !== "undefined") {
    return s.startsWith("/") ? window.location.origin + s : `https://${s}`;
  }
  return s;
};

export const PromoHandout = () => {
  const [searchParams] = useSearchParams();
  /* 카드 상세에서 「가입 안내문 만들기」로 넘어오면 ?card=<id>로 선택된 채로 진입 */
  const [cardId, setCardId] = useState(() => searchParams.get("card") || "");

  /* 광고 문구는 붙여넣지 않고, 카드에 등록된 심의필 문구(adCopy)를 그대로 사용한다 */
  const card = findCard(cardId);
  const rawText = card?.adCopy || "";

  const parsed = useMemo(() => parseAd(rawText), [rawText]);
  const url = parsed?.url || "";
  const prospectusUrl = absoluteUrl(card?.prospectusUrl || "");

  const qrSize = useMemo(() => {
    if (!url) return null;
    try {
      return buildQrPath(url).size;
    } catch {
      return 0;
    }
  }, [url]);
  const tooLong = qrSize === 0;
  const tooDense = qrSize > 56;
  const ready = Boolean(url) && !tooLong;

  useEffect(() => {
    const cleanup = () => document.documentElement.classList.remove("printing-promo");
    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, []);

  const handlePrint = () => {
    document.documentElement.classList.add("printing-promo");
    setTimeout(() => window.print(), 30);
  };

  return (
    <>
      <div className="space-y-5 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            상품 가입 안내문
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            eBiz 가입 링크와 심의필 광고 문구로, 고객에게 바로 인쇄해 드릴 안내문을 만듭니다.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
          <p className="text-[12.5px] leading-relaxed text-slate-700">
            카드를 선택하면 그 카드에 등록된 <strong className="font-semibold text-slate-900">eBiz 가입 링크</strong>와{" "}
            <strong className="font-semibold text-slate-900">심의필 광고 문구</strong>로 안내문이 만들어집니다. 링크는 QR로 바뀌고 문구는 원문 그대로 인쇄됩니다.
            <span className="mt-1 block text-[11.5px] text-slate-500">
              가입 링크는 고객이 타고 들어가 가입하면 담당 직원 실적으로 잡힙니다. 실서비스에서는 eBiz와 연동됩니다.
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">카드 선택</label>
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          >
            <option value="">카드를 선택하세요</option>
            {CARDS.filter((c) => c.adCopy).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {!card && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-8 text-center text-[13px] text-slate-500">
            위에서 카드를 선택하면 가입 안내문 미리보기가 나타납니다.
          </div>
        )}

        {card && (tooLong || tooDense) && (
          <div className="flex items-start gap-2 rounded-r-sm border-l-4 border-amber-500 bg-amber-50/60 px-4 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-slate-800">
              {tooLong
                ? "가입 링크가 너무 길어 QR로 만들 수 없습니다. eBiz 단축 링크를 사용해 주세요."
                : "링크가 길어 QR이 촘촘합니다. 인쇄물에서 잘 안 읽힐 수 있으니 단축 링크를 권합니다."}
            </p>
          </div>
        )}

        {card && !url && (
          <div className="flex items-start gap-2 rounded-r-sm border-l-4 border-amber-500 bg-amber-50/60 px-4 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-slate-800">
              선택한 카드에 가입 링크가 등록되어 있지 않습니다. 카드 데이터(adCopy)를 확인해 주세요.
            </p>
          </div>
        )}

        {ready && parsed && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">미리보기</div>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-shrink-0 rounded-sm border border-slate-200 bg-white p-3">
                <QrSvg text={url} size="180px" logo />
                <div className="mt-1 text-center text-[10px] text-slate-500">가입 QR</div>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                {parsed.eyebrow && (
                  <div className="text-[13px] font-semibold text-rose-600">{parsed.eyebrow}</div>
                )}
                {parsed.product && (
                  <div className="text-[20px] font-black leading-tight tracking-tight text-slate-900">
                    {parsed.product}
                  </div>
                )}
                {parsed.benefit && (
                  <p className="text-[14px] font-semibold leading-snug text-slate-700">
                    {parsed.benefit}
                  </p>
                )}
                <p className="break-all pt-1 text-[12px] leading-relaxed text-slate-500">{url}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-slate-900 px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-slate-700"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    안내문 인쇄
                  </button>
                  {prospectusUrl && (
                    <a
                      href={prospectusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 px-3 py-2 text-[12.5px] font-semibold text-slate-600 transition-colors hover:border-rose-400 hover:text-rose-700"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      상품설명서 열기
                    </a>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
              심의필 광고 문구는 임의로 고치지 않고 붙여넣은 원문 그대로 인쇄됩니다. 인쇄 전 QR을 직접 찍어 링크가 맞는지 확인하세요.
            </p>
          </div>
        )}
      </div>

      {ready &&
        parsed &&
        createPortal(<PromoPrint parsed={parsed} url={url} prospectusUrl={prospectusUrl} />, document.body)}
    </>
  );
};

const PromoPrint = ({ parsed, url, prospectusUrl }) => {
  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}`;

  return (
    <div
      className="hidden print:block print-report bg-white text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
      aria-hidden="true"
    >
      <div className="mx-auto max-w-3xl px-2 py-2 leading-snug">
        <div className="flex items-baseline justify-between border-b-2 border-slate-900 pb-2">
          <span className="text-[10px] font-black tracking-widest text-slate-500">
            iM뱅크 · 상품 가입 안내
          </span>
          <span className="text-[9px] text-slate-500">인쇄일 {printedAt}</span>
        </div>

        <div className="mt-3 flex items-start gap-5">
          <div className="min-w-0 flex-1">
            {parsed.eyebrow && (
              <div className="text-[13px] font-bold text-rose-600">{parsed.eyebrow}</div>
            )}
            {parsed.product && (
              <h1 className="mt-1 text-[26px] font-black leading-tight tracking-tight text-slate-900">
                {parsed.product}
              </h1>
            )}
            {parsed.benefit && (
              <p className="mt-2 text-[15px] font-semibold leading-snug text-slate-800">
                {parsed.benefit}
              </p>
            )}

            <div className="mt-3 rounded border border-slate-300 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-bold text-slate-700">가입 방법</div>
              <p className="mt-0.5 text-[11px] text-slate-700">
                휴대폰 카메라로 오른쪽 QR을 비추면 가입 화면으로 바로 연결됩니다.
              </p>
              <p className="mt-1 break-all text-[9px] text-slate-500">{url}</p>
            </div>
          </div>

          <div className="flex-shrink-0 text-center">
            <div className="rounded border border-slate-300 bg-white p-2">
              <QrSvg text={url} size="40mm" logo />
            </div>
            <div className="mt-1 text-[9.5px] font-semibold text-slate-600">QR로 바로 가입</div>
            {prospectusUrl && (
              <div className="mt-2 border-t border-dashed border-slate-300 pt-2">
                <div className="inline-block rounded border border-slate-200 bg-white p-1">
                  <QrSvg text={prospectusUrl} size="22mm" />
                </div>
                <div className="mt-0.5 text-[8.5px] text-slate-500">상품설명서</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-end justify-end gap-2 text-[9.5px] text-slate-600">
          <span>상담 점포 · 담당자</span>
          <span className="inline-block h-3 w-32 border-b border-slate-400" />
        </div>

        {parsed.body && (
          <section className="mt-3 border-t border-slate-300 pt-2 break-inside-avoid">
            <p className="whitespace-pre-wrap text-[9px] leading-snug text-slate-700">
              {parsed.body}
            </p>
          </section>
        )}

        {parsed.approvals.length > 0 && (
          <div className="mt-2 space-y-0.5 border-t-2 border-slate-900 pt-1.5 text-[9px] font-semibold text-slate-700">
            {parsed.approvals.map((a, i) => (
              <div key={i}>{a}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
