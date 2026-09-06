import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImagePlus,
  Plus,
  Keyboard,
  X,
} from "lucide-react";
import { cn } from "@shared/lib/format";
import "./richtext.css";

const MOD = typeof navigator !== "undefined" && /Mac|iP(hone|ad|od)/.test(navigator.platform) ? "⌘" : "Ctrl";

const SHORTCUTS = [
  { keys: `${MOD} B`, label: "굵게" },
  { keys: `${MOD} I`, label: "기울임" },
  { keys: `${MOD} U`, label: "밑줄" },
  { keys: `${MOD} ⇧ S`, label: "취소선" },
  { keys: `${MOD} ⌥ 1~3`, label: "제목 1·2·3" },
  { keys: `${MOD} ⇧ 7`, label: "번호 목록" },
  { keys: `${MOD} ⇧ 8`, label: "글머리 목록" },
  { keys: `${MOD} ⇧ B`, label: "인용" },
  { keys: `${MOD} Z`, label: "실행 취소" },
  { keys: `${MOD} ⇧ Z`, label: "다시 실행" },
];

const MARKDOWN = [
  { syntax: "# ", label: "제목 (## 소제목)" },
  { syntax: "- ", label: "글머리 목록 (* 도 가능)" },
  { syntax: "1. ", label: "번호 목록" },
  { syntax: "> ", label: "인용" },
  { syntax: "**굵게**", label: "굵게" },
  { syntax: "*기울임*", label: "기울임" },
  { syntax: "`코드`", label: "인라인 코드" },
  { syntax: "---", label: "구분선" },
];

function ShortcutHelp({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2 text-[14px] font-bold text-slate-900">
            <Keyboard className="h-4 w-4 text-im-600" /> 단축키 · 마크다운
          </div>
          <button onClick={onClose} aria-label="닫기" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-5 px-5 py-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">단축키</div>
            <ul className="space-y-1.5">
              {SHORTCUTS.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="text-slate-600">{s.label}</span>
                  <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">{s.keys}</kbd>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">마크다운 입력</div>
            <ul className="space-y-1.5">
              {MARKDOWN.map((m) => (
                <li key={m.syntax} className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="text-slate-600">{m.label}</span>
                  <code className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">{m.syntax}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-2.5 text-[11px] text-slate-400">
          줄 맨 앞에서 위 기호를 입력하면 자동으로 서식이 적용됩니다.
        </div>
      </div>
    </div>
  );
}

/* Notion식 리치 에디터 — 제목/본문 크기, 굵게·기울임·밑줄·취소선, 목록·인용,
   "+"로 이미지·구분선 삽입, 마크다운 단축입력(# 제목, - 목록, > 인용 등)을 지원한다.
   본문은 HTML로 저장되고, 글 상세에서 .rich-content 로 동일하게 렌더된다. */

const TEXT_STYLES = [
  { id: "p", label: "본문" },
  { id: "h1", label: "제목" },
  { id: "h2", label: "소제목" },
  { id: "h3", label: "작은 제목" },
];

const Tb = ({ on, onClick, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    aria-label={title}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800",
      on && "bg-im-50 text-im-700"
    )}
  >
    {children}
  </button>
);

const Divider = () => <span className="mx-0.5 h-5 w-px bg-slate-200" />;

export function RichEditor({ onChange, placeholder = "내용을 입력하세요." }) {
  const fileRef = useRef(null);
  const insertRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, underline: false }),
      Underline,
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: "",
    editorProps: {
      attributes: { class: "rich-content min-h-[460px] px-1 py-2" },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML(), editor.isEmpty),
  });

  if (!editor) return null;

  const curStyle = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p";

  const setStyle = (id) => {
    const c = editor.chain().focus();
    if (id === "p") c.setParagraph().run();
    else c.toggleHeading({ level: Number(id[1]) }).run();
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => editor.chain().focus().setImage({ src: r.result }).run();
    r.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="rounded-xl border border-slate-200">
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-slate-100 bg-slate-50/70 px-2 py-1.5">
        <select
          value={curStyle}
          onChange={(e) => setStyle(e.target.value)}
          className="mr-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[12px] font-semibold text-slate-700 focus:border-im-500 focus:outline-none"
        >
          {TEXT_STYLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <Divider />
        <Tb title="굵게" on={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Tb>
        <Tb title="기울임" on={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Tb>
        <Tb title="밑줄" on={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </Tb>
        <Tb title="취소선" on={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </Tb>

        <Divider />
        <Tb title="글머리 목록" on={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Tb>
        <Tb title="번호 목록" on={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Tb>
        <Tb title="인용" on={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Tb>

        <Divider />
        {/* + 삽입 */}
        <div className="relative" ref={insertRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insertRef.current?.classList.toggle("open")}
            className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[12px] font-semibold text-slate-600 transition-colors hover:border-im-400 hover:text-im-700"
          >
            <Plus className="h-3.5 w-3.5" /> 삽입
          </button>
          <div className="absolute left-0 top-full z-20 mt-1 hidden min-w-[9rem] rounded-lg border border-slate-200 bg-white p-1 shadow-lg [.open>&]:block">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                insertRef.current?.classList.remove("open");
                fileRef.current?.click();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-slate-700 hover:bg-slate-50"
            >
              <ImagePlus className="h-4 w-4 text-slate-400" /> 이미지
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                insertRef.current?.classList.remove("open");
                editor.chain().focus().setHorizontalRule().run();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-slate-700 hover:bg-slate-50"
            >
              <Minus className="h-4 w-4 text-slate-400" /> 구분선
            </button>
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />

        {/* 단축키 도움말 */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowHelp(true)}
          title="단축키 · 마크다운"
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <Keyboard className="h-3.5 w-3.5" /> 단축키
        </button>
      </div>

      {/* 입력 영역 */}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>

      {showHelp && <ShortcutHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
}
