import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { Printer, FileText, AlertTriangle, Sparkles, DownloadCloud, Check } from "lucide-react";
import { QrSvg, buildQrPath } from "@utility/components/QrCode";
import { CARDS, findCard, loadStoredLinks, saveStoredLink, resolveAdCopy } from "../data/cards";
import { cn } from "@shared/lib/format";

/* 전표에 찍히는 담당 행원 표기 (추후 로그인 정보로 대체 가능) */
const STAFF = "중산지점 행원 허영준";

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
  /* 카드 상세/카탈로그에서 넘어오면 ?card=<id>로 선택된 채로 진입 */
  const [cardId, setCardId] = useState(() => searchParams.get("card") || "");
  /* eBiz에서 링크를 아직 못 받은 카드는 「불러오기」 화면에서 붙여넣어(임시) 만든다 */
  const [manualText, setManualText] = useState("");
  const [importing, setImporting] = useState(false);
  const [showImport, setShowImport] = useState(false); // 불러오기(붙여넣기) 화면 노출
  const [stored, setStored] = useState(loadStoredLinks); // 저장된 링크(로컬)

  const card = findCard(cardId);
  const savedText = resolveAdCopy(card, stored); // 코드 등록 or 저장된 링크
  const hasLink = !!savedText;
  /* 저장/등록된 문구 우선, 없으면 방금 붙여넣은 문구 사용 */
  const rawText = savedText || manualText;

  const selectCard = (id) => {
    setCardId(id);
    setManualText("");
    setImporting(false);
    setShowImport(false);
  };

  /* 불러온(붙여넣은) 링크를 저장 — 다음부터 자동으로 불러온다 */
  const handleSave = () => {
    if (!manualText.trim()) return;
    setStored(saveStoredLink(cardId, manualText));
    setManualText("");
    setShowImport(false);
  };

  /* eBiz 링크 불러오기 — 실서비스에선 eBiz API 호출. 데모에선 잠깐 로딩 후
     붙여넣기 입력을 띄운다(직접 링크/문구 입력). */
  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setShowImport(true);
    }, 600);
  };

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
            가입 QR 발급
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            eBiz에서 카드 가입 링크를 불러와 QR 전표로 바로 인쇄합니다.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
          <p className="text-[12.5px] leading-relaxed text-slate-700">
            카드를 선택하면 <strong className="font-semibold text-slate-900">eBiz에서 가입 링크</strong>를 불러와 QR로 만들어 전표로 인쇄합니다.
            <span className="mt-1 block text-[11.5px] text-slate-500">
              가입 링크는 고객이 타고 들어가 가입하면 담당 직원 실적으로 잡힙니다.
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">카드 선택</label>
          <select
            value={cardId}
            onChange={(e) => selectCard(e.target.value)}
            className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          >
            <option value="">카드를 선택하세요</option>
            {CARDS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {!card && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-8 text-center text-[13px] text-slate-500">
            위에서 카드를 선택하면 eBiz에서 가입 링크를 불러옵니다.
          </div>
        )}

        {/* eBiz 링크 불러오기 — 저장/등록된 링크가 없으면 불러오기 버튼 → (데모)붙여넣기 */}
        {card && !hasLink && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            {!showImport ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <DownloadCloud className="h-5 w-5" />
                </div>
                <div className="text-[14px] font-bold text-slate-900">eBiz에서 가입 링크 불러오기</div>
                <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-slate-500">
                  「{card.name}」의 가입 링크를 eBiz에서 불러옵니다. 고객이 이 링크로 가입하면 담당 직원 실적으로 잡힙니다.
                </p>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
                >
                  <DownloadCloud className={cn("h-4 w-4", importing && "animate-pulse")} />
                  {importing ? "불러오는 중…" : "eBiz에서 불러오기"}
                </button>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  가입 링크 / 광고 문구 붙여넣기
                </label>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  rows={8}
                  placeholder={"eBiz에서 복사한 가입 링크(또는 광고 문구)를 붙여넣으세요."}
                  className="w-full resize-y rounded-sm border border-slate-300 px-3 py-2.5 text-[13px] leading-relaxed focus:border-rose-500 focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!parseAd(manualText)?.url}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    링크 저장
                  </button>
                  <span className="text-[11.5px] text-slate-400">
                    저장하면 다음부터 이 카드는 자동으로 불러옵니다. (직원 브라우저에 저장)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 저장/등록된 링크가 있는 카드 — 불러온 것으로 표시 */}
        {card && hasLink && url && (
          <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700">
            <Check className="h-4 w-4" />
            eBiz에서 「{card.name}」 가입 링크를 불러왔습니다.
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

        {card && hasLink && !url && (
          <div className="flex items-start gap-2 rounded-r-sm border-l-4 border-amber-500 bg-amber-50/60 px-4 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-slate-800">
              불러온 문구에서 가입 링크(http로 시작)를 찾지 못했습니다. 링크를 다시 확인해 주세요.
            </p>
          </div>
        )}

        {ready && parsed && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">전표 미리보기</div>
            <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="flex-shrink-0 rounded-sm border border-slate-200 bg-white p-3">
                <QrSvg text={url} size="180px" logo />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[18px] font-black leading-tight text-slate-900">
                  {card?.name || parsed.product}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                  휴대폰 카메라로 이 QR을 찍으면 「{card?.name || parsed.product}」 가입 화면으로 연결됩니다.
                </p>
                <p className="mt-2 text-[13px] font-bold text-slate-800">{STAFF}</p>
                <p className="mt-1 break-all text-[11px] text-slate-400">{url}</p>

                <div className="flex flex-wrap gap-2 pt-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-slate-900 px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-slate-700"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    전표 인쇄
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
              전표에는 QR·카드명·설명·행원명만 인쇄됩니다. 상세 혜택·유의사항은 상품설명서로 함께 안내하세요.
            </p>
          </div>
        )}
      </div>

      {ready &&
        parsed &&
        createPortal(<PromoPrint cardName={card?.name || parsed.product} url={url} />, document.body)}
    </>
  );
};

/* 전표 인쇄 — QR · 카드명 · 설명 · 행원명만. 상세 안내는 상품설명서로 대체한다. */
const PromoPrint = ({ cardName, url }) => {
  const now = new Date();
  const printedAt = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}`;

  return (
    <div
      className="hidden print:block print-slip bg-white text-slate-900"
      style={{ fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif" }}
      aria-hidden="true"
    >
      <div className="border border-slate-400 p-4 text-center" style={{ width: "88mm" }}>
        <div className="text-[16px] font-black leading-tight text-slate-900">{cardName}</div>
        <div className="mt-0.5 text-[10px] font-semibold tracking-wide text-slate-500">가입 안내 QR</div>

        <div className="my-3 flex justify-center">
          <QrSvg text={url} size="45mm" logo />
        </div>

        <p className="text-[11px] leading-snug text-slate-700">
          휴대폰 카메라로 QR을 찍으면
          <br />「{cardName}」 가입 화면으로 연결됩니다.
        </p>

        <div className="mt-3 border-t border-slate-300 pt-2 text-[12px] font-bold text-slate-900">
          {STAFF}
        </div>
        <div className="mt-0.5 text-[9px] text-slate-400">{printedAt}</div>
      </div>
    </div>
  );
};
