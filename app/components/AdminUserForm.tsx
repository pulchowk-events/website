'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminUserForm() {
  const [email, setEmail] = useState('');
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false); // Added loading state to prevent multiple requests

  const [mounted, setMounted] = useState(false);

  // UseEffect to handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleAdminUpdate() {
    if (loading) return; // Prevent action if already loading

    setLoading(true);
    const { error } = action === 'add'
      ? await supabase.from('admins').upsert({ email })
      : await supabase.from('admins').delete().eq('email', email);

    if (error) {
      setMessage('Error updating admin.');
    } else {
      setMessage(action === 'add' ? 'Admin added successfully!' : 'Admin removed successfully!');
    }

    setEmail('');
    setLoading(false);
  }

  if (!mounted) return null; // Prevent hydration mismatch by rendering nothing initially

  return (
    <div className="p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Add / Remove Admin</h2>

      <input
        placeholder="Admin Email"
        className="w-full p-3 border mb-4 rounded text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <select
        className="w-full p-3 mb-4 border rounded text-white"
        value={action}
        onChange={(e) => setAction(e.target.value as 'add' | 'remove')}
      >
        <option className='bg-black text-white' value="add">Add Admin</option>
        <option className='bg-black text-white' value="remove">Remove Admin</option>
      </select>

      <div className="flex items-center justify-between">
        <button
          onClick={handleAdminUpdate}
          disabled={loading}
          className={`bg-primary px-6 py-3 rounded-lg text-white ${loading ? 'opacity-50' : 'hover:bg-primary-dark'} transition duration-300`}
        >
          {loading ? 'Updating...' : 'Update Admins'}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-white ${
            message.includes('Error') ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};
