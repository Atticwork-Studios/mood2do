'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

type Props = {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value || '',
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  if (!editor) return null

  const btn = (active: boolean) =>
    `px-2 py-1 rounded text-xs font-medium border transition-colors ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
    }`

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">
      {/* Toolbar */}
      <div className="flex gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}>
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}>
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}>
          • List
        </button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="px-3 py-2 text-sm text-gray-900 min-h-[80px] prose prose-sm max-w-none focus:outline-none [&_.tiptap_p]:my-0.5"
      />
      {!value && (
        <style>{`
          .tiptap p.is-editor-empty:first-child::before {
            content: "${placeholder ?? 'Add notes…'}";
            color: #9ca3af;
            pointer-events: none;
            float: left;
            height: 0;
          }
        `}</style>
      )}
    </div>
  )
}
