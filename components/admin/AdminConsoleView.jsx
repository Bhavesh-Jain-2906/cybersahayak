'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  RefreshCw,
  Search,
  KeyRound,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Shield,
  MessageSquare,
  MessagesSquare,
  Lock,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ViewHeader from '@/components/layout/ViewHeader';

export default function AdminConsoleView() {
  const { session, user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConversations: 0,
    totalMessages: 0,
    securityStatus: 'RLS Active & Isolated',
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  // Form states for adding user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Feedback alerts
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // Fetch users & metrics from Admin API
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setFeedback({ type: null, message: '' });

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/admin/users', { headers });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch admin metrics.');
      }

      setUsers(data.users || []);
      setStats(
        data.stats || {
          totalUsers: (data.users || []).length,
          totalConversations: 0,
          totalMessages: 0,
          securityStatus: 'RLS Active',
        }
      );
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error communicating with database.' });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Handle adding user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setFeedback({ type: 'error', message: 'Name, email, and password are required.' });
      return;
    }

    if (newPassword.trim().length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setFormSubmitting(true);
    setFeedback({ type: null, message: '' });

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          password: newPassword.trim(),
          role: newRole,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user.');
      }

      setFeedback({ type: 'success', message: data.message || 'User added successfully!' });
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      fetchAdminData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle removing user
  const handleDeleteUser = async (userId) => {
    if (!userId) return;

    setFormSubmitting(true);
    setFeedback({ type: null, message: '' });

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove user.');
      }

      setFeedback({ type: 'success', message: data.message || 'User removed from database.' });
      setDeleteConfirmUser(null);
      fetchAdminData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.includes(q);
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100">
      <ViewHeader
        title="System Administrator Console"
        subtitle="Live PostgreSQL User Directory & Security Administration"
        icon={Shield}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-600/20 via-blue-900/30 to-indigo-950/40 border border-amber-500/30 p-6 backdrop-blur-md shadow-cool-blue flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Database Administrator Hub
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-xs text-blue-200/70 mt-0.5">
                  Direct database management of registered users, conversation threads, and RLS policies.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={fetchAdminData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-blue-900/40 text-blue-200 text-xs font-semibold transition-all"
                title="Refresh database records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-cool-blue transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add New User</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {feedback.message && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
                feedback.type === 'error'
                  ? 'bg-red-500/15 border-red-500/30 text-red-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback({ type: null, message: '' })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Database Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 shadow-sm dark:shadow-vanta-card">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-blue-300/60">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalUsers}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-blue-400/50">
                Registered in PostgreSQL
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 shadow-sm dark:shadow-vanta-card">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-blue-300/60">
                <span>Conversations</span>
                <MessagesSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalConversations}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-blue-400/50">
                Isolated threads logged
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 shadow-sm dark:shadow-vanta-card">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-blue-300/60">
                <span>Total Messages</span>
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalMessages}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-blue-400/50">
                Audited & saved
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/70 shadow-sm dark:shadow-vanta-card">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-blue-300/60">
                <span>Security Engine</span>
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-base font-bold text-amber-400 truncate">
                RLS Enforced
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-blue-400/50">
                Zero leak cross-tenant isolation
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="rounded-2xl bg-white dark:bg-[#030612] border border-slate-200 dark:border-blue-950/80 shadow-sm dark:shadow-vanta-card overflow-hidden">
            {/* Table Search & Controls */}
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-blue-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white">
                  Database User Accounts
                </h3>
                <p className="text-xs text-slate-500 dark:text-blue-300/50">
                  Manage citizen credentials and permissions
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-blue-400/60 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-8 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-[#060a17] border-b border-slate-200 dark:border-blue-950/60 text-slate-500 dark:text-blue-300/60 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 hidden md:table-cell">User ID (UUID)</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Registered Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                          <span>Loading database records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No user accounts match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isThisAdmin = Boolean(u.isAdmin || u.role === 'admin' || (currentAdmin?.id && u.id === currentAdmin.id));
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isThisAdmin
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {isThisAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                  {u.name}
                                </div>
                                <div className="text-[11px] text-slate-400 dark:text-blue-300/50 truncate">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                isThisAdmin
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                              }`}
                            >
                              {isThisAdmin ? 'Administrator' : 'Citizen / User'}
                            </span>
                          </td>

                          <td className="py-3 px-4 hidden md:table-cell font-mono text-[11px] text-slate-400 dark:text-blue-400/50">
                            {u.id}
                          </td>

                          <td className="py-3 px-4 hidden sm:table-cell text-slate-500 dark:text-blue-300/60">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {isThisAdmin ? (
                              <span className="text-[11px] text-slate-400 italic">Protected</span>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmUser(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
                                title="Remove user from database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add New User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#030612] border border-blue-900/50 p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-blue-950/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Register New User in Database
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Initial Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Assigned Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060a14] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="user">Citizen / User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-slate-200 dark:border-blue-950/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-cool-blue transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#030612] border border-red-900/50 p-6 shadow-2xl relative text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-red-400 mb-3 font-semibold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Confirm User Deletion from Database</span>
            </div>

            <p className="text-slate-600 dark:text-blue-200/80 leading-relaxed mb-3">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">{deleteConfirmUser.name}</strong> (
              <span className="text-blue-300">{deleteConfirmUser.email}</span>)?
            </p>

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 mb-4">
              <strong>Action Impact:</strong> This will delete their profile and permanently wipe all their conversations and AI messages via PostgreSQL cascade.
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={formSubmitting}
                onClick={() => handleDeleteUser(deleteConfirmUser.id)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {formSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Yes, Remove from Database</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
