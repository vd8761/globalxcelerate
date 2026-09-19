'use client';

export function CopilotTypingIndicator() {
  return (
    <div className="flex gap-2 items-start">
      <div className="h-6 w-6 rounded-full bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
        <div className="h-3 w-3 rounded-full bg-cyan-400/50" />
      </div>
      <div className="bg-slate-100 rounded-xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
