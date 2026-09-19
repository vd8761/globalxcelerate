'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (html: string) => void;
  maxLength?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function CoverLetterEditor({
  value,
  onChange,
  maxLength = 5000,
  disabled = false,
  placeholder = 'Tell the employer why you\'re a great fit...',
}: Props) {
  const [content, setContent] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = content.replace(/<[^>]*>/g, '').length;
  const isNearLimit = charCount > maxLength - 500;
  const isOverLimit = charCount > maxLength;

  const handleChange = useCallback(
    (newValue: string) => {
      setContent(newValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(newValue);
      }, 2000);
    },
    [onChange]
  );

  // Save on blur
  const handleBlur = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onChange(content);
  }, [content, onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(200, el.scrollHeight)}px`;
    }
  }, [content]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
        <ToolbarBtn
          label="Bold"
          onClick={() => wrapSelection(textareaRef, '<strong>', '</strong>', content, handleChange)}
          disabled={disabled}
        >
          <strong className="text-xs">B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          label="Italic"
          onClick={() => wrapSelection(textareaRef, '<em>', '</em>', content, handleChange)}
          disabled={disabled}
        >
          <em className="text-xs">I</em>
        </ToolbarBtn>
        <ToolbarBtn
          label="List"
          onClick={() => wrapSelection(textareaRef, '<li>', '</li>', content, handleChange)}
          disabled={disabled}
        >
          <span className="text-xs">• List</span>
        </ToolbarBtn>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'w-full min-h-[200px] p-4 text-sm text-slate-800 rounded-lg border border-slate-200 resize-none',
          'focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all',
          'placeholder:text-slate-400',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-50'
        )}
      />

      <div className="flex justify-end">
        <span
          className={cn(
            'text-xs font-medium',
            isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-slate-400'
          )}
        >
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  );
}

function ToolbarBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
    >
      {children}
    </button>
  );
}

function wrapSelection(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  openTag: string,
  closeTag: string,
  content: string,
  onChange: (val: string) => void
) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = content.substring(start, end);
  const newContent = content.substring(0, start) + openTag + selected + closeTag + content.substring(end);
  onChange(newContent);
}
