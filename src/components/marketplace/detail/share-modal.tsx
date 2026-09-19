'use client';

import { useState } from 'react';
import { X, Link2, Linkedin, Mail, Twitter, Check } from 'lucide-react';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  opportunityId: string;
}

export function ShareModal({ open, onClose, title, opportunityId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/marketplace/${opportunityId}`
    : '';

  const shareText = title ? `Check out this opportunity: ${title}` : 'Check out this opportunity on GlobalXcelerate';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const shareOptions = [
    {
      icon: Linkedin,
      label: 'Share on LinkedIn',
      onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      icon: Twitter,
      label: 'Share on X (Twitter)',
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank'),
    },
    {
      icon: Mail,
      label: 'Share via Email',
      onClick: () => window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Opportunity</h3>

        {/* Copy link */}
        <div className="flex items-center gap-2 mb-4">
          <input
            readOnly
            value={url}
            className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 truncate"
          />
          <button
            onClick={copyLink}
            className="h-10 px-4 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share options */}
        <div className="space-y-2">
          {shareOptions.map((option) => (
            <button
              key={option.label}
              onClick={option.onClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-sm text-slate-700 transition-colors"
            >
              <option.icon className="w-5 h-5 text-slate-400" />
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
