'use client';

import Link from 'next/link';
import { FileSearch, FolderSearch } from 'lucide-react';

interface Props {
  filterActive?: boolean;
  onResetFilter?: () => void;
}

export function ApplicationEmptyState({ filterActive, onResetFilter }: Props) {
  if (filterActive) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <FolderSearch className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">No applications match your filter</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-5">
          Try adjusting your search or filters to find what you&apos;re looking for.
        </p>
        {onResetFilter && (
          <button
            onClick={onResetFilter}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
        <FileSearch className="w-8 h-8 text-cyan-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">No applications yet</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">
        Start browsing opportunities and apply to ones that match your profile and interests.
      </p>
      <Link
        href="/student/marketplace"
        className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 shadow-sm transition-colors"
      >
        Browse Marketplace
      </Link>
    </div>
  );
}
