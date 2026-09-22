import Link from 'next/link';
import { Search, User, FileText, Award } from 'lucide-react';

const ACTIONS = [
  { label: 'Browse Opportunities', href: '/student/marketplace', Icon: Search },
  { label: 'Edit Profile', href: '/student/profile', Icon: User },
  { label: 'View Applications', href: '/student/applications', Icon: FileText },
  { label: 'GX Score', href: '/student/gx-score', Icon: Award },
];

export function QuickActions() {
  return (
    <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 text-center group"
        >
          <div className="bg-blue-50 p-2.5 rounded-full group-hover:bg-blue-100 transition-colors">
            <action.Icon className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
