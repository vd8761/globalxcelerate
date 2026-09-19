import Link from 'next/link';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function DetailNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Opportunity not found</h2>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
        This opportunity is no longer available or may have been removed.
      </p>
      <Link
        href="/student/marketplace"
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>
    </div>
  );
}
