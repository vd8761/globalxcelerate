'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import type { DashboardNotification } from '@/types/dashboard';
import { MAX_NOTIFICATIONS } from '@/lib/dashboard/constants';

interface NotificationsFeedProps {
  notifications: DashboardNotification[];
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationsFeed({ notifications }: NotificationsFeedProps) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const display = notifications.slice(0, MAX_NOTIFICATIONS);
  const unreadCount = display.filter((n) => !n.read && !readIds.has(n.id)).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </div>

      {display.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bell className="w-10 h-10 text-gray-200 mb-2" />
          <p className="text-sm text-gray-500">No new notifications</p>
        </div>
      ) : (
        <div className="space-y-1">
          {display.map((notification) => {
            const isUnread = !notification.read && !readIds.has(notification.id);
            return (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  isUnread ? 'bg-blue-50/50 hover:bg-blue-50' : 'bg-transparent hover:bg-gray-50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    isUnread ? 'bg-blue-500' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm text-slate-800 line-clamp-1 ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {formatRelativeTime(notification.created_at)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100">
        <a href="#" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
          View All Notifications →
        </a>
      </div>
    </div>
  );
}
