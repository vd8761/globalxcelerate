import { AlertTriangle } from 'lucide-react';

export function ExpiredBanner() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800 font-medium">
          This opportunity has closed and is no longer accepting applications.
        </p>
      </div>
    </div>
  );
}
