'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ban, CheckCircle, Trash2, UserCog } from 'lucide-react';

interface UserActionsProps {
  userId: string;
  isSuspended: boolean;
  currentRole: string;
}

export function UserActions({ userId, isSuspended, currentRole }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const handleSuspendActivate = async () => {
    setLoading(true);
    try {
      await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isSuspended ? 'activate' : 'suspend' }),
      });
      router.refresh();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (role: string) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_role', role }),
      });
      router.refresh();
    } catch (error) {
      console.error('Role change failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/v1/admin/users/${userId}`, { method: 'DELETE' });
      router.push('/admin/users');
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Account Actions</h2>
      <div className="flex flex-wrap items-center gap-4">
        {/* Suspend / Activate */}
        <Button
          onClick={handleSuspendActivate}
          disabled={loading}
          className={
            isSuspended
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }
        >
          {isSuspended ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Activate Account
            </>
          ) : (
            <>
              <Ban className="mr-2 h-4 w-4" />
              Suspend Account
            </>
          )}
        </Button>

        {/* Change Role */}
        <div className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-gray-400" />
          <Select value={selectedRole} onValueChange={handleChangeRole} disabled={loading}>
            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Change Role" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="employer">Employer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Delete Account */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Delete User Account</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete this user account? This action cannot be undone.
                The user will be permanently banned from the platform.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteDialogOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
