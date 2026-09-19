'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      }
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loggingOut}
      variant="outline"
      size="sm"
      className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
      data-testid="logout-button"
    >
      <LogOut className="w-4 h-4 mr-2" />
      {loggingOut ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
