import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Library,
  Plus,
  ArrowLeft,
  ArrowRight,
  Rss,
  Check,
  PenLine,
  ImagePlus,
  X,
  TrendingUp,
  TrendingDown,
  Users,
  Trash2,
  Megaphone,
  Building2,
  Hash,
} from "lucide-react";
import { HubShell } from "./HubShell";
import { useLibrary } from "./library/useLibrary";
import {
  ChannelAvatar,
  CHANNEL_ICON_LIST,
  CHANNEL_ICONS,
  CHANNEL_COLOR_LIST,
  CHANNEL_COLORS,
} from "./library/channelStyle";
import { CARD } from "@shared/lib/surface";
import { cn } from "@shared/lib/format";
import "./library/richtext.css";

/* 무거운 리치 에디터(Tiptap)는 글쓰기 진입 시에만 로드 */
const RichEditor = lazy(() => import("./library/RichEditor").then((m) => ({ default: m.RichEditor })));

/* 지식 라이브러리 — 현업 담당자가 채널(게시판)을 열고 글을 올리고, 직원은 구독해 몰아본다.
   탭: 구독 피드 / 전체 채널.  하위 화면: 채널 상세 · 글 상세 · 글쓰기 · 채널 만들기. */

const DAY = 86400000;
const fmtWhen = (ts) => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(diff / DAY);
  if (day < 7) return `${day}일 전`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const isHtml = (s) => /^\s*</.test(s || "");
const plain = (s) => (s || "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();

/* 분류 자유 입력 — 아래는 자동완성 제안일 뿐, 무엇이든 입력 가능 */
const CATEGORY_SUGGESTIONS = [
  "아침 시황",
  "데일리 리포트",
  "WM 코멘트",
  "세무 상식",
  "종목·이슈",
  "시장 전략",
  "상품 안내",
  "규제·컴플라이언스",
];

/* ── 공통 조각 ───────────────────────────────────────── */

const SubscribeButton = ({ on, onClick, size = "md" }) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border font-bold transition-colors",
      size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-[12px]",
      on
        ? "border-im-500 bg-im-500 text-white hover:bg-im-600"
        : "border-slate-300 bg-white text-slate-600 hover:border-im-400 hover:text-im-700"
    )}
  >
    {on ? <Check className="h-3.5 w-3.5" /> : <Rss className="h-3.5 w-3.5" />}
    {on ? "구독중" : "구독"}
  </button>
);

const DeptTag = ({ dept }) =>
  dept ? (
    <span className="inline-flex items-center gap-1 text-slate-400">
      <Building2 className="h-3 w-3" />
      {dept}
    </span>
  ) : null;

/* 카드뉴스형 등락 타일(텍스트 데이터) */
const MoverGrid = ({ cards }) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {cards.map((c, i) => {
      const up = c.dir === "up";
      const down = c.dir === "down";
      return (
        <div
          key={i}
          className={cn(
            "rounded-lg border px-3 py-2.5",
            up ? "border-rose-200 bg-rose-50/60" : down ? "border-blue-200 bg-blue-50/60" : "border-slate-200 bg-slate-50"
          )}
        >
          <div className="truncate text-[12.5px] font-bold text-slate-800">{c.name}</div>
          <div
            className={cn(
              "mt-0.5 flex items-center gap-1 text-[13px] font-bold tabular-nums",
              up ? "text-rose-600" : down ? "text-blue-600" : "text-slate-500"
            )}
          >
            {up && <TrendingUp className="h-3.5 w-3.5" />}
            {down && <TrendingDown className="h-3.5 w-3.5" />}
            {c.change}
          </div>
        </div>
      );
    })}
  </div>
);

/* 업로드 이미지(카드뉴스 등) — 세로로 크게, 잘리지 않게 */
const PostImages = ({ images }) => (
  <div className="mx-auto max-w-[540px] space-y-3">
    {images.map((src, i) => (
      <img key={i} src={src} alt="" className="w-full rounded-xl border border-slate-200 shadow-sm" />
    ))}
  </div>
);

/* 목록의 글 한 줄 */
const PostRow = ({ post, channel, onOpen, showChannel }) => (
  <button onClick={onOpen} className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50">
    {showChannel && channel && <ChannelAvatar icon={channel.icon} color={channel.color} image={channel.image} size="sm" />}
    <div className="min-w-0 flex-1">
      {showChannel && channel && (
        <div className="mb-0.5 flex items-center gap-1.5 text-[11px]">
          <span className="font-bold text-im-700">{channel.name}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400">{fmtWhen(post.createdAt)}</span>
        </div>
      )}
      <div className="truncate text-[14px] font-bold text-slate-900">{post.title}</div>
      <div className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-slate-500">{plain(post.body)}</div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
        {!showChannel && (
          <>
            <span>{post.author}</span>
            <span className="text-slate-300">·</span>
            <span>{fmtWhen(post.createdAt)}</span>
          </>
        )}
        {post.images?.length > 0 && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">이미지 {post.images.length}</span>}
        {post.cards?.length > 0 && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">카드뉴스</span>}
      </div>
    </div>
    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300" />
  </button>
);

/* 전체 채널 카드 */
const ChannelCard = ({ channel, count, subCount, subscribed, latest, onOpen, onToggle }) => (
  <div className={cn(CARD, "flex flex-col p-4")}>
    <div className="flex items-start gap-3">
      <button onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <ChannelAvatar icon={channel.icon} color={channel.color} image={channel.image} />
        <div className="min-w-0">
          <h3 className="truncate text-[14.5px] font-bold text-slate-900">{channel.name}</h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-400">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">{channel.category}</span>
            <DeptTag dept={channel.dept} />
          </div>
        </div>
      </button>
      <SubscribeButton on={subscribed} onClick={onToggle} size="sm" />
    </div>

    <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-slate-500">{channel.desc}</p>

    <button
      onClick={onOpen}
      className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-left transition-colors hover:bg-slate-100"
    >
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-600">
        {latest ? latest.title : "아직 올라온 글이 없습니다"}
      </span>
      {latest && <span className="flex-shrink-0 text-[10px] text-slate-400">{fmtWhen(latest.createdAt)}</span>}
    </button>

    <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
      <span className="inline-flex items-center gap-1">
        <Users className="h-3 w-3" /> 구독 {subCount.toLocaleString()}
      </span>
      <span>글 {count}</span>
      <span className="ml-auto text-slate-400">{channel.author}</span>
    </div>
  </div>
);

/* ── 글쓰기 (전체화면) ─────────────────────────────────── */

/* 해시태그 입력 — Enter/스페이스/쉼표로 추가, 백스페이스로 마지막 삭제 */
function TagInput({ tags, onChange }) {
  const [val, setVal] = useState("");
  const add = (t) => {
    const clean = t.replace(/[#,\s]+/g, "").trim();
    if (!clean || tags.includes(clean) || tags.length >= 8) return;
    onChange([...tags, clean]);
  };
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      add(val);
      setVal("");
    } else if (e.key === "Backspace" && !val && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 focus-within:border-im-500">
      <Hash className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-im-50 px-2 py-0.5 text-[12px] font-semibold text-im-700">
          #{t}
          <button onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`${t} 삭제`} className="text-im-400 hover:text-im-700">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => {
          add(val);
          setVal("");
        }}
        placeholder={tags.length === 0 ? "해시태그 입력 후 Enter (예: 아침시황)" : "태그 추가"}
        className="min-w-[8rem] flex-1 bg-transparent text-[12.5px] text-slate-700 placeholder:text-slate-300 focus:outline-none"
      />
    </div>
  );
}

function PostComposer({ channel, onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [empty, setEmpty] = useState(true);
  const [tags, setTags] = useState([]);
  const canSubmit = title.trim() && !empty;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={onCancel} className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {channel.name}
      </button>

      <div className={cn(CARD, "overflow-hidden")}>
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
          <ChannelAvatar icon={channel.icon} color={channel.color} image={channel.image} size="sm" />
          <div>
            <div className="text-[14px] font-bold text-slate-900">새 글 쓰기</div>
            <div className="text-[11.5px] text-slate-500">{channel.name} · 구독자에게 발행됩니다</div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full border-b border-slate-200 pb-2 text-[19px] font-bold text-slate-900 placeholder:text-slate-300 focus:border-im-500 focus:outline-none"
          />

          <Suspense fallback={<div className="rounded-xl border border-slate-200 px-4 py-10 text-center text-[12px] text-slate-400">에디터 불러오는 중…</div>}>
            <RichEditor onChange={(html, isEmpty) => { setBody(html); setEmpty(isEmpty); }} />
          </Suspense>

          <div>
            <div className="mb-1.5 text-[12px] font-semibold text-slate-500">해시태그</div>
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <button onClick={onCancel} className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-800">
            취소
          </button>
          <button
            onClick={() => onSubmit({ title, body, tags })}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-md bg-im-600 px-4 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PenLine className="h-3.5 w-3.5" /> 발행
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 채널 만들기 (전체화면, 전문 폼) ───────────────────── */

/* 폼 필드 래퍼 — 컴포넌트 밖에 두어야 매 렌더 리마운트(포커스 유실)를 막는다 */
const Field = ({ label, hint, children }) => (
  <div>
    <div className="mb-1.5 flex items-baseline gap-1.5">
      <label className="text-[12.5px] font-bold text-slate-700">{label}</label>
      {hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

/* 분류 입력 — 자유 입력 + 클릭/타이핑 시 제안 드롭다운(커스텀, datalist 대체) */
function CategoryCombobox({ value, onChange, suggestions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const q = value.trim().toLowerCase();
  const list = q ? suggestions.filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q) : suggestions;
  return (
    <div className="relative" ref={ref}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="예: 아침 시황, 세무 상식, 시장 전략 …"
        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:border-im-500 focus:outline-none focus:ring-2 focus:ring-im-500/20"
      />
      {open && list.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          {list.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className="block w-full rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-slate-700 hover:bg-slate-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelComposer({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("news");
  const [color, setColor] = useState("im");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const iconFileRef = useRef(null);
  const canSubmit = name.trim();

  const onPickIcon = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result);
    r.readAsDataURL(f);
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button onClick={onCancel} className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> 지식 라이브러리
      </button>

      <div className={cn(CARD, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-[15px] font-bold text-slate-900">채널 개설</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">내 콘텐츠를 정기적으로 발행할 게시판을 만듭니다. 개설 후 바로 글을 쓸 수 있습니다.</p>
        </div>

        {/* 미리보기 */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <ChannelAvatar icon={icon} color={color} image={image} size="lg" />
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-slate-900">{name.trim() || "채널 이름"}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="rounded bg-white px-1.5 py-0.5 font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                {category.trim() || "분류"}
              </span>
              미리보기
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <Field label="채널 이름">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 나만의 시황 노트, 세일즈 팁 모음"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[14px] font-semibold text-slate-900 placeholder:text-slate-300 focus:border-im-500 focus:outline-none focus:ring-2 focus:ring-im-500/20"
            />
          </Field>

          <Field label="아이콘" hint="아이콘 선택 또는 이미지 업로드">
            <div className="flex max-h-[148px] flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {/* 이미지 업로드 타일 */}
              <button
                type="button"
                onClick={() => iconFileRef.current?.click()}
                title="이미지 업로드"
                className={cn(
                  "flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border transition-colors",
                  image ? "border-im-500 ring-2 ring-im-500/30" : "border-dashed border-slate-300 text-slate-400 hover:border-im-400 hover:text-im-600"
                )}
              >
                {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-[18px] w-[18px]" />}
              </button>
              {CHANNEL_ICON_LIST.map((k) => {
                const Icon = CHANNEL_ICONS[k];
                const on = !image && icon === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setIcon(k);
                      setImage(null);
                    }}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                      on ? "border-im-500 bg-im-50 text-im-600" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
                    )}
                    aria-label={k}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                );
              })}
            </div>
            {image && (
              <button onClick={() => setImage(null)} className="mt-1.5 text-[11px] font-semibold text-slate-500 hover:text-rose-600">
                업로드 이미지 제거
              </button>
            )}
            <input ref={iconFileRef} type="file" accept="image/*" className="hidden" onChange={onPickIcon} />
          </Field>

          <Field label="강조색" hint={image ? "이미지 아이콘 사용 중" : "아이콘 배경색"}>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_COLOR_LIST.map((k) => {
                const c = CHANNEL_COLORS[k];
                const on = color === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setColor(k)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-transform",
                      c.bg,
                      on ? "ring-2 ring-offset-2 " + c.ring : "hover:scale-105",
                      image && "opacity-40"
                    )}
                    aria-label={k}
                  >
                    <span className={cn("h-3.5 w-3.5 rounded-full", c.dot)} />
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="분류" hint="직접 입력하거나 제안에서 선택">
            <CategoryCombobox value={category} onChange={setCategory} suggestions={CATEGORY_SUGGESTIONS} />
          </Field>

          <Field label="소개" hint="선택">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="이 채널에서 어떤 내용을 올릴지 한두 줄로 소개하세요."
              rows={3}
              className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700 placeholder:text-slate-300 focus:border-im-500 focus:outline-none focus:ring-2 focus:ring-im-500/20"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
          <button onClick={onCancel} className="rounded-md px-3 py-2 text-[12px] font-semibold text-slate-500 hover:text-slate-800">
            취소
          </button>
          <button
            onClick={() => onSubmit({ name, icon, color, image, category, desc })}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 rounded-md bg-im-600 px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-im-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> 채널 개설
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 글 상세 ───────────────────────────────────────── */

function PostDetail({ post, channel, isMine, onBack, onOpenChannel, onRemove }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> 뒤로
      </button>

      <article className={cn(CARD, "overflow-hidden")}>
        <button
          onClick={onOpenChannel}
          className="flex w-full items-center gap-2.5 border-b border-slate-100 px-5 py-3 text-left transition-colors hover:bg-slate-50"
        >
          <ChannelAvatar icon={channel.icon} color={channel.color} image={channel.image} size="sm" />
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-im-700">{channel.name}</div>
            <div className="text-[11px] text-slate-400">{channel.category}</div>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
        </button>

        <div className="px-5 py-5 sm:px-7">
          <h1 className="text-[20px] font-bold leading-snug text-slate-900">{post.title}</h1>
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-slate-400">
            <span className="font-semibold text-slate-600">{post.author}</span>
            <span className="text-slate-300">·</span>
            <span>{fmtWhen(post.createdAt)}</span>
          </div>

          {post.cards?.length > 0 && (
            <div className="mt-5">
              <MoverGrid cards={post.cards} />
            </div>
          )}

          {post.images?.length > 0 && (
            <div className="mt-5">
              <PostImages images={post.images} />
            </div>
          )}

          {isHtml(post.body) ? (
            <div className="rich-content mt-5" dangerouslySetInnerHTML={{ __html: post.body }} />
          ) : (
            <div className="mt-5 space-y-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700">{post.body}</div>
          )}

          {post.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
              {post.tags.map((t) => (
                <span key={t} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-600">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {isMine && (
          <div className="flex justify-end border-t border-slate-100 px-5 py-3">
            <button
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> 글 삭제
            </button>
          </div>
        )}
      </article>
    </div>
  );
}

/* ── 채널 상세 ───────────────────────────────────────── */

function ChannelDetail({ channel, posts, subCount, subscribed, onBack, onToggle, onWrite, onOpenPost }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> 지식 라이브러리
      </button>

      <div className={cn(CARD, "p-5")}>
        <div className="flex items-start gap-3.5">
          <ChannelAvatar icon={channel.icon} color={channel.color} image={channel.image} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] font-bold text-slate-900">{channel.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-slate-400">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">{channel.category}</span>
              <DeptTag dept={channel.dept} />
              <span>{channel.author}</span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> 구독 {subCount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <SubscribeButton on={subscribed} onClick={onToggle} />
            <button
              onClick={onWrite}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-slate-800"
            >
              <PenLine className="h-3.5 w-3.5" /> 글쓰기
            </button>
          </div>
        </div>
        {channel.desc && <p className="mt-3 border-t border-slate-100 pt-3 text-[12.5px] leading-relaxed text-slate-500">{channel.desc}</p>}
      </div>

      {posts.length === 0 ? (
        <div className={cn(CARD, "px-5 py-12 text-center")}>
          <p className="text-[13px] font-semibold text-slate-600">아직 올라온 글이 없습니다</p>
          <p className="mt-1 text-[12px] text-slate-400">첫 글을 올려 구독자에게 발행해 보세요.</p>
        </div>
      ) : (
        <div className={cn(CARD, "overflow-hidden")}>
          <div className="divide-y divide-slate-100">
            {posts.map((p) => (
              <PostRow key={p.id} post={p} onOpen={() => onOpenPost(p.id)} showChannel={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 메인 ───────────────────────────────────────────── */

export default function LibraryPage() {
  const lib = useLibrary();
  const [tab, setTab] = useState("feed"); // feed | browse
  const [channelId, setChannelId] = useState(null);
  const [postId, setPostId] = useState(null);
  const [composer, setComposer] = useState(null); // null | {mode:"post", channelId} | {mode:"channel"}

  useEffect(() => {
    const prev = document.title;
    document.title = "지식 라이브러리 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  const openChannel = (id) => {
    setChannelId(id);
    setPostId(null);
  };
  const openPost = (id) => setPostId(id);
  const backToList = () => {
    setPostId(null);
    setChannelId(null);
  };

  const activePost = postId ? lib.posts.find((p) => p.id === postId) : null;
  const activeChannel = channelId ? lib.channelById(channelId) : null;

  /* 1) 작성 화면 */
  if (composer?.mode === "channel") {
    return (
      <HubShell>
        <ChannelComposer
          onCancel={() => setComposer(null)}
          onSubmit={(v) => {
            const ch = lib.addChannel(v);
            setComposer(null);
            openChannel(ch.id);
          }}
        />
      </HubShell>
    );
  }
  if (composer?.mode === "post") {
    const ch = lib.channelById(composer.channelId);
    return (
      <HubShell>
        <PostComposer
          channel={ch}
          onCancel={() => setComposer(null)}
          onSubmit={(v) => {
            const post = lib.addPost({ channelId: ch.id, ...v });
            setComposer(null);
            openChannel(ch.id);
            setPostId(post.id);
          }}
        />
      </HubShell>
    );
  }

  /* 2) 글 상세 */
  if (activePost) {
    const ch = lib.channelById(activePost.channelId);
    return (
      <HubShell>
        <PostDetail
          post={activePost}
          channel={ch}
          isMine={activePost.author === lib.me}
          onBack={() => (channelId ? setPostId(null) : backToList())}
          onOpenChannel={() => openChannel(ch.id)}
          onRemove={() => {
            lib.removePost(activePost.id);
            setPostId(null);
          }}
        />
      </HubShell>
    );
  }

  /* 3) 채널 상세 */
  if (activeChannel) {
    return (
      <HubShell>
        <ChannelDetail
          channel={activeChannel}
          posts={lib.postsOf(activeChannel.id)}
          subCount={lib.subCountOf(activeChannel.id)}
          subscribed={lib.isSubscribed(activeChannel.id)}
          onBack={backToList}
          onToggle={() => lib.toggleSubscribe(activeChannel.id)}
          onWrite={() => setComposer({ mode: "post", channelId: activeChannel.id })}
          onOpenPost={openPost}
        />
      </HubShell>
    );
  }

  /* 4) 메인 목록 (구독 피드 / 전체 채널) */
  const feed = lib.feedPosts;
  const subChannels = lib.channels.filter((c) => lib.isSubscribed(c.id));

  return (
    <HubShell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-im-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">지식 라이브러리</h1>
          </div>
          <p className="mt-1 text-[13px] text-slate-500">
            현업 담당자가 직접 여는 채널을 구독해 보세요. 아침 시황·데일리 리포트·WM 코멘트·세무상식을 한곳에서.
          </p>
        </div>
        <button
          onClick={() => setComposer({ mode: "channel" })}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md bg-im-600 px-3.5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-im-700"
        >
          <Plus className="h-4 w-4" /> 채널 만들기
        </button>
      </div>

      {/* 탭 */}
      <div className="mb-5 flex items-center gap-1 border-b border-slate-200">
        {[
          { id: "feed", label: "구독 피드", count: feed.length },
          { id: "browse", label: "전체 채널", count: lib.channels.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors",
              tab === t.id ? "border-im-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {t.id === "feed" ? <Rss className="h-3.5 w-3.5" /> : <Library className="h-3.5 w-3.5" />}
            {t.label}
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "feed" ? (
        feed.length === 0 ? (
          <div className={cn(CARD, "flex flex-col items-center gap-3 px-5 py-12 text-center")}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-im-50 text-im-600">
              <Rss className="h-6 w-6" />
            </div>
            <p className="text-[14px] font-semibold text-slate-700">구독한 채널의 글이 여기에 모입니다</p>
            <p className="max-w-sm text-[12.5px] leading-relaxed text-slate-400">
              전체 채널에서 관심 있는 채널을 구독하면, 새 글이 이 피드에 최신순으로 쌓입니다.
            </p>
            <button
              onClick={() => setTab("browse")}
              className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-im-300 bg-white px-3 py-1.5 text-[12.5px] font-bold text-im-700 hover:bg-im-50"
            >
              채널 둘러보기 <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11.5px] font-semibold text-slate-400">구독 중</span>
              {subChannels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openChannel(c.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 text-[11.5px] font-semibold text-slate-600 hover:border-im-300 hover:text-im-700"
                >
                  <ChannelAvatar icon={c.icon} color={c.color} image={c.image} size="sm" className="!h-5 !w-5 rounded-md" />
                  {c.name}
                </button>
              ))}
            </div>

            <div className={cn(CARD, "overflow-hidden")}>
              <div className="divide-y divide-slate-100">
                {feed.map((p) => (
                  <PostRow key={p.id} post={p} channel={lib.channelById(p.channelId)} onOpen={() => openPost(p.id)} showChannel />
                ))}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lib.channels.map((c) => (
            <ChannelCard
              key={c.id}
              channel={c}
              count={lib.countOf(c.id)}
              subCount={lib.subCountOf(c.id)}
              subscribed={lib.isSubscribed(c.id)}
              latest={lib.latestOf(c.id)}
              onOpen={() => openChannel(c.id)}
              onToggle={() => lib.toggleSubscribe(c.id)}
            />
          ))}
        </div>
      )}

      <p className="mt-8 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
        <Megaphone className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        누구나 채널을 열어 자신의 콘텐츠를 발행할 수 있는 사내 게시판입니다(데모, 저장은 이 브라우저에만 유지). 게시 내용은 작성자 의견이며 투자권유가 아닙니다.
      </p>
    </HubShell>
  );
}
