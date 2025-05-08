'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  }, []);

  async function fetchAdminUsers() {
    try {
      setLoading(true);
      
      // Fetch all admins first
      const { data: admins, error: adminError } = await supabase
        .from('admins')
        .select('email');
      
      if (adminError) {
        console.error('Error fetching admins:', adminError);
        toast.error('Failed to load admin users');
        return;
      }
      
      // Get the email addresses of all admins
      const adminEmails = admins?.map(admin => admin.email) || [];
      
      // Fetch users with admin status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .order('name');
        
      if (userError) {
        console.error('Error fetching users:', userError);
        toast.error('Failed to load users');
        return;
      }
      
      // Combine the data
      const usersWithAdminStatus = userData?.map(user => ({
        ...user,
        isAdmin: adminEmails.includes(user.email)
      })) || [];
      
      setUsers(usersWithAdminStatus);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminStatus(userId: string, email: string, makeAdmin: boolean) {
    try {
      setProcessing(prev => ({ ...prev, [userId]: true }));
      
      if (makeAdmin) {
        // Add to admins table
        const { error } = await supabase
          .from('admins')
          .insert([{ email }]);
          
        if (error) {
          console.error('Error adding admin:', error);
          toast.error('Failed to add admin privileges');
          return;
        }
        
        toast.success('Admin privileges granted');
      } else {
        // Remove from admins table
        const { error } = await supabase
          .from('admins')
          .delete()
          .eq('email', email);
          
        if (error) {
          console.error('Error removing admin:', error);
          toast.error('Failed to remove admin privileges');
          return;
        }
        
        toast.success('Admin privileges revoked');
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: makeAdmin } : user
      ));
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong');
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
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
      
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', newAdminEmail)
        .maybeSingle();
        
      if (userError) {
        console.error('Error checking user:', userError);
        toast.error('Failed to verify user');
        return;
      }
      
      if (!userData) {
        toast.error('User not found with this email');
        return;
      }
      
      // Check if already an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', newAdminEmail)
        .maybeSingle();
        
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        toast.error('Failed to verify admin status');
        return;
      }
      
      if (adminData) {
        toast.info('This user is already an admin');
        return;
      }
      
      // Add to admins table
      const { error } = await supabase
        .from('admins')
        .insert([{ email: newAdminEmail }]);
        
      if (error) {
        console.error('Error adding admin:', error);
        toast.error('Failed to add admin privileges');
        return;
      }
      
      toast.success('Admin privileges granted');
      setNewAdminEmail('');
      
      // Update local state if user wasn't in the list before
      const userExists = users.some(user => user.email === newAdminEmail);
      if (userExists) {
        setUsers(users.map(user => 
          user.email === newAdminEmail ? { ...user, isAdmin: true } : user
        ));
      } else {
        setUsers([...users, { ...userData, isAdmin: true }]);
      }
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong');
    } finally {
      setAddingAdmin(false);
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAddNewAdmin} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="newAdminEmail" className="block text-sm font-medium text-zinc-300 mb-2">
              Add New Admin By Email
            </label>
            <input
              type="email"
              id="newAdminEmail"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2"
              placeholder="user@example.com"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={addingAdmin || !newAdminEmail}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center h-10"
            >
              {addingAdmin ? (
                <>
                  <span className="mr-2">Adding...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm pl-10 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2"
          placeholder="Search users by name or email"
        />
      </div>
      
      <div className="bg-zinc-700/30 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-600">
            <thead className="bg-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Admin Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-800/30 divide-y divide-zinc-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-zinc-700 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-zinc-200">{user.name || 'Unnamed User'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.isAdmin ? (
                        <button
                          onClick={() => handleAdminStatus(user.id, user.email, false)}
                          disabled={!!processing[user.id]}
                          className="text-red-400 hover:text-red-300 inline-flex items-center"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          {processing[user.id] ? 'Processing...' : 'Remove Admin'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAdminStatus(user.id, user.email, true)}
                          disabled={!!processing[user.id]}
                          className="text-green-400 hover:text-green-300 inline-flex items-center"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          {processing[user.id] ? 'Processing...' : 'Make Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-zinc-400">
                    {searchTerm ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}