/* 마켓 지표 라인 차트 — 마켓 보드의 스파크라인·호버 팝오버·상세 모달·인쇄에서 공유한다.
   데이터는 이미 받아 둔 10일치 일별 종가(series: {t, c}[]).
   등락 색은 국내 관례(상승=빨강, 하락=파랑)를 따른다.

   비공식 시세라 시리즈가 비면(목업 등) 조용히 아무것도 그리지 않는다. */

const UP = "#ef4444"; // red-500
const DOWN = "#3b82f6"; // blue-500
const FLAT = "#94a3b8"; // slate-400

const trend = (series) => {
  if (!series || series.length < 2) return { color: FLAT, up: null };
  const first = series[0].c;
  const last = series[series.length - 1].c;
  if (last > first) return { color: UP, up: true };
  if (last < first) return { color: DOWN, up: false };
  return { color: FLAT, up: null };
};

const buildPath = (series, w, h, pad) => {
  const vals = series.map((d) => d.c);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const x = (i) => (series.length === 1 ? pad + innerW / 2 : pad + (i / (series.length - 1)) * innerW);
  const y = (v) => pad + innerH - ((v - min) / range) * innerH;
  const line = vals.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return { line, x, y, min, max };
};

/* 셀 안에 들어가는 아주 작은 스파크라인 — 축·라벨 없음 */
export const Sparkline = ({ series, width = 60, height = 22, className }) => {
  if (!series || series.length < 2) return null;
  const { color } = trend(series);
  const pad = 2;
  const { line } = buildPath(series, width, height, pad);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

/* 큰 차트 — 면적 채움 + 최저/최고 라벨 + 마지막 점. 팝오버·모달·인쇄 공용.
   printSafe=true면 인쇄에서도 색이 유지되도록 인라인 스타일을 쓴다(색 자체가 인라인이라 무방). */
export const MarketChart = ({ series, width = 460, height = 150, label }) => {
  if (!series || series.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center rounded-lg bg-slate-50 text-[12px] text-slate-400"
      >
        시세 시계열이 없습니다
      </div>
    );
  }
  const { color, up } = trend(series);
  const pad = 26;
  const { line, x, y, min, max } = buildPath(series, width, height, pad);
  const lastI = series.length - 1;
  const area = `${line} L ${x(lastI).toFixed(1)} ${(height - pad).toFixed(1)} L ${x(0).toFixed(1)} ${(
    height - pad
  ).toFixed(1)} Z`;
  const gid = `mc-fill-${(label || "x").replace(/[^a-zA-Z0-9]/g, "")}`;
  const fmt = (v) => v.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  const fmtDate = (t) => {
    const d = new Date(t);
    return `${d.getMonth() + 1}.${d.getDate()}`;
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} 추이`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 상·하한 가이드라인 */}
      <line x1={pad} y1={pad} x2={width - pad} y2={pad} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 3" />
      <line
        x1={pad}
        y1={height - pad}
        x2={width - pad}
        y2={height - pad}
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="2 3"
      />

      <path d={area} fill={`url(#${gid})`} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* 마지막 점 */}
      <circle cx={x(lastI)} cy={y(series[lastI].c)} r="3" fill={color} />

      {/* 최고·최저 값 라벨 */}
      <text x={pad} y={pad - 8} fontSize="10" fill="#94a3b8">
        최고 {fmt(max)}
      </text>
      <text x={pad} y={height - pad + 14} fontSize="10" fill="#94a3b8">
        최저 {fmt(min)}
      </text>

      {/* 기간 라벨 */}
      <text x={x(0)} y={height - 4} fontSize="9" fill="#cbd5e1" textAnchor="start">
        {fmtDate(series[0].t)}
      </text>
      <text x={x(lastI)} y={height - 4} fontSize="9" fill="#cbd5e1" textAnchor="end">
        {fmtDate(series[lastI].t)}
      </text>

      {/* 접근성용 추세 표기(시각적으론 색으로 표현) */}
      <desc>{up === null ? "보합" : up ? "상승" : "하락"}</desc>
    </svg>
  );
};
