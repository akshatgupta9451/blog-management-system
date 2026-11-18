import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/utils/format';

const ToolbarButton = ({ onClick, active, disabled, label, children }) => (
  <button
    type="button"
    // Keep focus (and the selection) in the editor; otherwise keystrokes typed right after
    // clicking a button are lost while focus travels back
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={cn(
      'inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-medium transition-colors disabled:opacity-30',
      active ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
    )}
  >
    {children}
  </button>
);

const Divider = () => <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />;

const Toolbar = ({ editor }) => {
  // Re-renders the toolbar only when these values change, not on every keystroke
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      code: e.isActive('code'),
      codeBlock: e.isActive('codeBlock'),
      link: e.isActive('link'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  const toggleLink = () => {
    if (state.link) {
      chain().extendMarkRange('link').unsetLink().run();
      return;
    }
    const url = window.prompt('Link URL', 'https://');
    if (!url || url === 'https://') return;
    chain().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
      <ToolbarButton label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      >
        <em className="font-serif">I</em>
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={state.strike}
        onClick={() => chain().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="Heading 2"
        active={state.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={state.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="Bullet list"
        active={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      >
        “ ”
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={state.code}
        onClick={() => chain().toggleCode().run()}
      >
        {'<>'}
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        active={state.codeBlock}
        onClick={() => chain().toggleCodeBlock().run()}
      >
        {'{ }'}
      </ToolbarButton>
      <ToolbarButton
        label={state.link ? 'Remove link' : 'Add link'}
        active={state.link}
        onClick={toggleLink}
      >
        Link
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        ↷
      </ToolbarButton>
    </div>
  );
};

/**
 * TipTap rich-text editor that reads/writes HTML. The server sanitizes whatever is sent,
 * so this only needs to produce reasonable markup. `value` is used as the initial content.
 */
const RichTextEditor = ({ id, value, onChange, onBlur, error, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-invalid': String(Boolean(error)),
        'aria-label': placeholder,
        class: 'prose prose-sm sm:prose-base max-w-none min-h-72 px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
    onBlur: () => onBlur?.(),
  });

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-white focus-within:ring-2',
        error
          ? 'border-red-400 focus-within:ring-red-200'
          : 'focus-within:border-primary-500 focus-within:ring-primary-100 border-gray-300'
      )}
    >
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
