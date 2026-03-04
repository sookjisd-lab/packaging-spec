import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { ResizableImage } from '../../extensions/resizableImage';
import type { JSONContent } from '@tiptap/react';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface RichTextEditorProps {
  content?: JSONContent;
  onChange: (content: JSONContent) => void;
  placeholder?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const insertImageFromFile = async (
  file: File,
  editor: ReturnType<typeof useEditor>
) => {
  if (!editor) return;
  if (!file.type.startsWith('image/')) return;
  if (file.size > MAX_IMAGE_SIZE) {
    alert('이미지 크기는 5MB 이하여야 합니다.');
    return;
  }
  const base64 = await fileToBase64(file);
  editor.chain().focus().setImage({ src: base64 }).run();
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          event.preventDefault();
          Array.from(files).forEach(file => {
            insertImageFromFile(file, editor);
          });
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) insertImageFromFile(file, editor);
            return true;
          }
        }
        return false;
      },
    },
  });

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      for (const file of Array.from(files)) {
        await insertImageFromFile(file, editor);
      }
      e.target.value = '';
    },
    [editor]
  );

  return (
    <div className="rich-text-editor border border-gray-200 rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded text-sm font-bold hover:bg-gray-200 ${
            editor?.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
          title="굵게"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded text-sm hover:bg-gray-200 ${
            editor?.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
          title="목록"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2h-.01a1 1 0 0 1-1-1ZM2.99 9a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM1.99 15.25a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2h-.01a1 1 0 0 1-1-1Z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded text-sm hover:bg-gray-200 ${
            editor?.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
          title="번호 목록"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            <text x="1" y="7" fontSize="6" fontWeight="bold" fill="currentColor">1</text>
            <text x="1" y="12.5" fontSize="6" fontWeight="bold" fill="currentColor">2</text>
            <text x="1" y="18" fontSize="6" fontWeight="bold" fill="currentColor">3</text>
          </svg>
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={handleImageButtonClick}
          className="p-1.5 rounded text-sm hover:bg-gray-200 text-gray-600 flex items-center gap-1"
          title="이미지 삽입"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909-4.22-4.22a.75.75 0 0 0-1.06 0L2.5 11.06ZM12 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">이미지</span>
        </button>
      </div>

      {/* 에디터 */}
      <EditorContent editor={editor} />

      {/* 숨김 파일 인풋 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
