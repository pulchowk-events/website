'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, UserPlus, UserMinus, Search } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export default function AdminUserForm() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAdminUsers() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load admin users');
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminStatus(userId: string, email: string, makeAdmin: boolean) {
    try {
      setProcessing((prev) => ({ ...prev, [userId]: true }));
      const response = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, makeAdmin }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to ' + (makeAdmin ? 'add' : 'remove') + ' admin privileges'
        );
      }
      toast.success(data.message || (makeAdmin ? 'Admin added' : 'Admin removed'));
      setUsers(users.map((u) => (u.id === userId ? { ...u, isAdmin: makeAdmin } : u)));
    } catch (err) {
      console.error('Error updating admin status:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setProcessing((prev) => ({ ...prev, [userId]: false }));
    }
  }

  async function handleAddNewAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newAdminEmail) {
      toast.error('Please enter an email address');
      return;
    }
    try {
      setAddingAdmin(true);
      const response = await fetch('/api/admin/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add admin privileges');
      toast.success(data.message || 'Admin added');
      setNewAdminEmail('');

      if (data.user) {
        const userExists = users.some((u) => u.email === newAdminEmail);
        if (userExists) {
          setUsers(users.map((u) =>
            u.email === newAdminEmail ? { ...u, isAdmin: true } : u
          ));
        } else {
          setUsers([...users, data.user]);
        }
      } else {
        fetchAdminUsers();
      }
    } catch (err) {
      console.error('Error adding new admin:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAddingAdmin(false);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="admin-users">
      <form onSubmit={handleAddNewAdmin} className="admin-users__add">
        <div className="field" style={{ flex: 1, minWidth: 0 }}>
          <label htmlFor="newAdminEmail" className="field__label">
            Add admin by email
          </label>
          <input
            id="newAdminEmail"
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className="input"
            placeholder="user@example.com"
            disabled={addingAdmin}
          />
        </div>
        <button
          type="submit"
          disabled={addingAdmin || !newAdminEmail}
          className="btn btn--primary"
          style={{ height: 40, alignSelf: 'flex-end' }}
        >
          <span className="btn__label">
            <UserPlus size={14} style={{ marginRight: 8 }} />
            {addingAdmin ? 'Adding…' : 'Add admin'}
          </span>
          <span className="btn__label btn__label--dup" aria-hidden="true">
            <UserPlus size={14} style={{ marginRight: 8 }} />
            {addingAdmin ? 'Adding…' : 'Add admin'}
          </span>
        </button>
      </form>

      <div className="admin-users__search">
        <Search size={14} />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-users__search-input"
          placeholder="Search users by name or email"
          aria-label="Search users"
        />
      </div>

      {filteredUsers.length > 0 ? (
        <div className="admin-users__table-wrap">
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th style={{ textAlign: 'right' }}>Admin status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="admin-users__row">
                  <td>
                    <div className="admin-users__identity">
                      <span className="admin-users__avatar">
                        <User size={14} />
                      </span>
                      <span className="admin-users__name">{user.name || 'Unnamed user'}</span>
                    </div>
                  </td>
                  <td className="admin-users__email">{user.email}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {user.isAdmin ? (
                      <button
                        type="button"
                        onClick={() => handleAdminStatus(user.id, user.email, false)}
                        disabled={!!processing[user.id]}
                        className="admin-users__action"
                        data-tone="danger"
                      >
                        <UserMinus size={13} />
                        {processing[user.id] ? 'Working…' : 'Remove admin'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdminStatus(user.id, user.email, true)}
                        disabled={!!processing[user.id]}
                        className="admin-users__action"
                        data-tone="ok"
                      >
                        <UserPlus size={13} />
                        {processing[user.id] ? 'Working…' : 'Make admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state__title">
            {searchTerm ? 'No users match your search.' : 'No users found.'}
          </p>
          <p className="empty-state__desc">
            {searchTerm ? 'Try a different name or email.' : 'Users appear here once they sign in.'}
          </p>
        </div>
      )}
    </div>
  );
}
