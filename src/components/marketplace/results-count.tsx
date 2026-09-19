interface ResultsCountProps {
  page: number;
  pageSize: number;
  totalItems: number;
}

export function ResultsCount({ page, pageSize, totalItems }: ResultsCountProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <p className="text-sm text-slate-500">
      Showing <span className="font-medium text-slate-700">{start}-{end}</span> of{' '}
      <span className="font-medium text-slate-700">{totalItems.toLocaleString()}</span> opportunities
    </p>
  );
}
