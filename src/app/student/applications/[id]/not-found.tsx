import Link from 'next/link';
import { FileX, ArrowLeft } from 'lucide-react';

export default function ApplicationNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FileX className="w-7 h-7 text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Application not found</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          This application doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
        <Link
          href="/student/applications"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </Link>
      </div>
    </div>
  );
}
