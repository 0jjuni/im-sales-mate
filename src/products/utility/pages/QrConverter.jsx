import { useMemo, useState } from "react";
import { Link2, Check, Copy, Printer, AlertTriangle } from "lucide-react";
import { QrSvg, buildQrPath } from "../components/QrCode";
import { UtilitySlip } from "../components/UtilitySlip";
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

const PURPOSE_PRESETS = ["카드 신청", "예금 가입", "대출 상담 신청", "앱 설치", "이벤트 응모"];

export const QrConverter = () => {
  const [input, setInput] = useState("");
  const [purpose, setPurpose] = useState("");
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => normalizeUrl(input), [input]);

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
            링크 QR 변환기
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            신청 링크를 QR로 만들어 전표로 인쇄합니다.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">링크</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="예: im-sales-mate.vercel.app 또는 https://…"
                className="w-full rounded-sm border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-sky-500 focus:outline-none"
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
              placeholder="예: 카드 신청"
              className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PURPOSE_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    purpose === p
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-300 bg-white text-slate-500 hover:border-sky-400 hover:text-sky-700"
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
              <div className="flex-shrink-0 rounded-sm border border-slate-200 bg-white p-3">
                <QrSvg text={url} size="200px" />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                {purpose && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                      용도
                    </div>
                    <div className="text-[15px] font-bold text-slate-900">{purpose}</div>
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
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
                        ? "border-sky-500 text-sky-700"
                        : "border-slate-300 text-slate-600 hover:border-sky-400 hover:text-sky-700"
                    )}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    링크 복사
                  </button>
                  <button
                    onClick={() => window.print()}
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

      {ready && (
        <UtilitySlip
          title={purpose ? `${purpose} 안내` : "신청 링크 안내"}
          figure={<QrSvg text={url} size="32mm" />}
          rows={[
            ...(purpose ? [{ label: "용도", value: purpose }] : []),
            { label: "연결 주소", value: url },
            { label: "이용 방법", value: "휴대폰 카메라로 QR을 비추면 신청 화면으로 연결됩니다." },
          ]}
          note="QR이 읽히지 않으면 연결 주소를 직접 입력해 접속하실 수 있습니다."
        />
      )}
    </>
  );
};
