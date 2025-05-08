'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminProductForm() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [approved, setApproved] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function addProduct() {
    if (loading) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.from('products').insert({
        name,
        url,
        description,
        approved,
      });

      if (error) {
        console.error('Supabase insert error:', error);
        setMessage('Error adding product.');
      } else {
        setMessage('Product added successfully!');
        setName('');
        setUrl('');
        setDescription('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Add Product</h2>

      <input
        placeholder="Product Name"
        className="w-full p-3 mb-4 rounded border text-white"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Product Slug"
        className="w-full p-3 mb-4 border rounded text-white"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <textarea
        placeholder="Description"
        className="w-full p-3 mb-4 border rounded text-white"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={addProduct}
          disabled={loading}
          className={`bg-primary px-6 py-3 rounded-lg text-white ${
            loading ? 'opacity-50' : 'hover:bg-primary-dark'
          } transition duration-300`}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-white ${
            message.includes('Error') || message.includes('wrong') ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
