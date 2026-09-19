'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Users, GraduationCap, Building2, Shield, Search, MoreHorizontal, Eye, Ban, Trash2, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  onboarding_status: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until?: string | null;
}

interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, per_page: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      if (search) params.set('search', search);
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        let filteredUsers = json.data || [];
        if (statusFilter === 'suspended') {
          filteredUsers = filteredUsers.filter((u: User) => u.banned_until);
        } else if (statusFilter === 'active') {
          filteredUsers = filteredUsers.filter((u: User) => !u.banned_until);
        }
        setUsers(filteredUsers);
        setMeta(json.meta);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = async (userId: string, action: string) => {
    try {
      if (action === 'delete') {
        await fetch(`/api/v1/admin/users/${userId}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/v1/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
      }
      fetchUsers();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const studentCount = users.filter((u) => u.role === 'student').length;
  const employerCount = users.filter((u) => u.role === 'employer').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'employer':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusBadge = (user: User) => {
    const isSuspended = !!user.banned_until;
    if (isSuspended) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#050607] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage platform users and their roles</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400 mt-2">{meta.total}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-400">Students</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400 mt-2">{studentCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-400">Employers</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400 mt-2">{employerCount}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-yellow-400" />
              <h3 className="text-sm font-medium text-gray-400">Admins</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{adminCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => { setRoleFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-800 text-white">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="employer">Employer</SelectItem>
              <SelectItem value="program_provider">Program Provider</SelectItem>
              <SelectItem value="university_admin">University Admin</SelectItem>
              <SelectItem value="platform_admin">Platform Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-gray-900/50 border-gray-800 text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Name / Email</TableHead>
                <TableHead className="text-gray-400">Role</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Joined</TableHead>
                <TableHead className="text-gray-400">Last Active</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-800">
                    <TableCell><Skeleton className="h-5 w-48 bg-gray-800" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 bg-gray-800" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 bg-gray-800" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 bg-gray-800" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 bg-gray-800" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8 bg-gray-800 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow className="border-gray-800">
                  <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800/30">
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeClass(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-gray-300">{formatDate(user.last_sign_in_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                          <DropdownMenuItem asChild className="text-gray-300 hover:text-white focus:text-white focus:bg-gray-800">
                            <a href={`/admin/users/${user.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </a>
                          </DropdownMenuItem>
                          {user.banned_until ? (
                            <DropdownMenuItem
                              onClick={() => handleAction(user.id, 'activate')}
                              className="text-green-400 focus:text-green-400 focus:bg-gray-800"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleAction(user.id, 'suspend')}
                              className="text-yellow-400 focus:text-yellow-400 focus:bg-gray-800"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setUserToDelete(user.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-400 focus:text-red-400 focus:bg-gray-800"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta.total_pages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)); }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'text-gray-400 hover:text-white'}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, meta.total_pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage(pageNum); }}
                      isActive={page === pageNum}
                      className={page === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-400 hover:text-white'}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage(Math.min(meta.total_pages, page + 1)); }}
                  className={page >= meta.total_pages ? 'pointer-events-none opacity-50' : 'text-gray-400 hover:text-white'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User Account</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this user? This action cannot be undone. The user will be permanently banned from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (userToDelete) {
                  handleAction(userToDelete, 'delete');
                }
                setDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
