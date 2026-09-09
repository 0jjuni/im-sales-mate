import { useMemo, useRef, useState } from "react";
import { Link2, Check, Copy, Printer, AlertTriangle, DownloadCloud, X, ImageDown } from "lucide-react";
import { QrSvg, buildQrPath } from "../components/QrCode";
import { UtilitySlip } from "../components/UtilitySlip";
import { PrintPreviewModal } from "@shared/components/PrintPreviewModal";
import { cn } from "@shared/lib/format";

/* 링크 → QR 변환기.

   상담 중 권유한 상품을 고객이 그 자리에서 신청하지 못하고 나갈 때, 신청 링크를
   QR로 뽑아 명함과 함께 건네는 용도다. 문자 발송이 되는 건은 문자로 보내면 되고,
   이건 그 자리에서 종이로 줘야 하는 경우를 맡는다. */

/* 스킴이 없으면 https를 붙인다. 창구에서 주소만 복사해 오는 경우가 대부분이다 */
const normalizeUrl = (raw) => {
  const s = (raw || "").trim();
  if (!s) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
  return `https://${s}`;
};

const PURPOSE_PRESETS = ["마이데이터 가입", "예금 가입", "대출 상담 신청", "앱 설치", "이벤트 응모"];

/* eBiz 링크 목록(데모) — 실서비스에서는 eBiz 조회 결과로 대체한다.
   지금은 예시로 iM 세일즈메이트 접속 링크 하나를 담아 둔다. */
const EBIZ_LINKS = [
  { name: "iM 세일즈메이트", url: "https://im-sales-mate.vercel.app", desc: "영업점 상담 보조 플랫폼 접속" },
];

export const QrConverter = () => {
  const [input, setInput] = useState("");
  const [purpose, setPurpose] = useState("");
  const [copied, setCopied] = useState(false);
  const [ebizOpen, setEbizOpen] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [saved, setSaved] = useState(false);
  const qrRef = useRef(null);

  const url = useMemo(() => normalizeUrl(input), [input]);

  /* 화면의 QR(SVG)만 캔버스로 그려 JPG로 저장. JPG는 투명이 없으니 흰 배경을 깐다. */
  const saveJpg = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    const img = new Image();
    img.onload = () => {
      const size = 720;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/jpeg", 0.92);
      a.download = `QR_${(purpose || "link").trim().replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    };
    img.src = src;
  };

  /* 모듈 수를 미리 구한다. 용량 초과 여부와 인쇄 시 촘촘함을 함께 판단한다 */
  const qrSize = useMemo(() => {
    if (!url) return null;
    try {
      return buildQrPath(url).size;
    } catch {
      return 0; // 용량 초과
    }
  }, [url]);

  const tooLong = qrSize === 0;

  /* 전표 QR은 32mm다. 한 모듈이 0.5mm보다 작아지면 인쇄물에서 잘 안 읽힌다.
     32 / (모듈수 + 여백 8) >= 0.5 → 모듈수 56 이하 */
  const tooDense = qrSize > 56;

  const ready = Boolean(url) && !tooLong;

  const copy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <div className="space-y-5 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            QR코드 생성기
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            링크를 QR 코드로 만들어 전표로 인쇄합니다.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700">링크</label>
              <button
                type="button"
                onClick={() => setEbizOpen(true)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-slate-600 transition-colors hover:border-im-400 hover:text-im-700"
              >
                <DownloadCloud className="h-3.5 w-3.5" />
                eBiz에서 불러오기
              </button>
            </div>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="예: im-sales-mate.vercel.app 또는 https://…"
                className="w-full rounded-sm border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-im-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              용도 <span className="font-medium text-slate-400">(선택 · 전표에 함께 인쇄)</span>
            </label>
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="예: 마이데이터 가입"
              className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm focus:border-im-500 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PURPOSE_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    purpose === p
                      ? "border-im-500 bg-im-500 text-white"
                      : "border-slate-300 bg-white text-slate-500 hover:border-im-400 hover:text-im-700"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(tooLong || tooDense) && (
          <div className="flex items-start gap-2 rounded-r-sm border-l-4 border-amber-500 bg-amber-50/60 px-4 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-slate-800">
              {tooLong
                ? "링크가 너무 길어 QR로 만들 수 없습니다. 단축 링크를 사용해 주세요."
                : "링크가 길어 QR이 촘촘합니다. 전표로 인쇄하면 잘 안 읽힐 수 있으니 단축 링크를 권합니다."}
            </p>
          </div>
        )}

        {ready && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div ref={qrRef} className="flex-shrink-0 rounded-sm border border-slate-200 bg-white p-3">
                <QrSvg text={url} size="200px" logo />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                {purpose && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-im-700">
                      용도
                    </div>
                    <div className="text-[15px] font-bold text-slate-900">{purpose}</div>
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-im-700">
                    연결 주소
                  </div>
                  <p className="break-all text-[13.5px] leading-relaxed text-slate-800">{url}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={copy}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-sm border px-3 py-2 text-[12.5px] font-semibold transition-colors",
                      copied
                        ? "border-im-500 text-im-700"
                        : "border-slate-300 text-slate-600 hover:border-im-400 hover:text-im-700"
                    )}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    링크 복사
                  </button>
                  <button
                    onClick={saveJpg}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-sm border px-3 py-2 text-[12.5px] font-semibold transition-colors",
                      saved
                        ? "border-im-500 text-im-700"
                        : "border-slate-300 text-slate-600 hover:border-im-400 hover:text-im-700"
                    )}
                  >
                    {saved ? <Check className="h-3.5 w-3.5" /> : <ImageDown className="h-3.5 w-3.5" />}
                    이미지 저장(JPG)
                  </button>
                  <button
                    onClick={() => setShowPrint(true)}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-slate-900 px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-slate-700"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    전표 인쇄
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
              인쇄 전에 QR을 직접 찍어 링크가 맞는지 확인하세요.
            </p>
          </div>
        )}
      </div>

      {ready && showPrint && (
        <PrintPreviewModal title="전표 미리보기" onClose={() => setShowPrint(false)}>
          <UtilitySlip
            preview
            title={purpose ? `${purpose} 안내` : "신청 링크 안내"}
            figure={<QrSvg text={url} size="32mm" logo />}
            rows={[
              ...(purpose ? [{ label: "용도", value: purpose }] : []),
              { label: "연결 주소", value: url },
              { label: "이용 방법", value: "휴대폰 카메라로 QR을 비추면 신청 화면으로 연결됩니다." },
            ]}
            note="QR이 읽히지 않으면 연결 주소를 직접 입력해 접속하실 수 있습니다."
          />
        </PrintPreviewModal>
      )}

      {/* eBiz 링크 선택 팝업 (데모) */}
      {ebizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden" onClick={() => setEbizOpen(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-slate-900">eBiz 링크 불러오기</div>
                <div className="text-[11px] text-slate-500">불러올 링크를 선택하세요 (데모)</div>
              </div>
              <button onClick={() => setEbizOpen(false)} aria-label="닫기" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-80 divide-y divide-slate-100 overflow-auto">
              {EBIZ_LINKS.map((l) => (
                <li key={l.url + l.name}>
                  <button
                    onClick={() => {
                      setInput(l.url);
                      setPurpose(l.desc || "");
                      setEbizOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-im-50 text-im-700">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-bold text-slate-900">{l.name}</div>
                      <div className="truncate text-[11.5px] text-slate-500">{l.url}</div>
                    </div>
                    <DownloadCloud className="h-4 w-4 flex-shrink-0 text-im-600" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-slate-100 px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">
              실제로는 eBiz 조회 결과가 여기에 나열됩니다. 지금은 예시 링크만 표시됩니다.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
