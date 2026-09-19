'use client';

import { useState } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import Link from 'next/link';

interface LoginPromptDialogProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export function LoginPromptDialog({ open, onClose, feature = 'this feature' }: LoginPromptDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-cyan-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Sign in to continue</h3>
          <p className="text-sm text-slate-500 mt-1">
            Create an account or sign in to access {feature}.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
