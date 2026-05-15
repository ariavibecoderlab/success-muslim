import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, ImageIcon, LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface ToolBtnProps {
  onAction: () => void;
  active?: boolean;
  children: React.ReactNode;
}

function ToolBtn({ onAction, active, children }: ToolBtnProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center h-8 w-8 rounded-md text-sm transition-colors',
        active
          ? 'bg-secondary text-secondary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      )}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onAction}
    >
      {children}
    </button>
  );
}

interface BlogEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export default function BlogEditor({ content, onChange }: BlogEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your article…' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from('blog-images').upload(path, file);
    if (error) {
      toast.error('Image upload failed');
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(path);
    editor.chain().focus().setImage({ src: publicUrl }).run();
    e.target.value = '';
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
        <ToolBtn onAction={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onAction={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="h-4 w-4" />
        </ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn onAction={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onAction={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onAction={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <Heading3 className="h-4 w-4" />
        </ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn onAction={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onAction={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn onAction={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
          <Quote className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onAction={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
          <Code className="h-4 w-4" />
        </ToolBtn>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn onAction={() => fileInputRef.current?.click()}>
          <ImageIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onAction={setLink} active={editor.isActive('link')}>
          <LinkIcon className="h-4 w-4" />
        </ToolBtn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:max-w-full"
      />
    </div>
  );
}
