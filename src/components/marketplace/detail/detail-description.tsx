interface DetailDescriptionProps {
  description: string;
  responsibilities: string[];
}

export function DetailDescription({ description, responsibilities }: DetailDescriptionProps) {
  return (
    <div className="space-y-6">
      <div
        className="prose prose-slate prose-sm max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-cyan-600"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {responsibilities && responsibilities.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-3">Responsibilities</h3>
          <ul className="space-y-2">
            {responsibilities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
