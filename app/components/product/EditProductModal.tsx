'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface EditProductModalProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    image_url: string | null;
  };
  onClose: () => void;
}

export default function EditProductModal({ product, onClose }: EditProductModalProps) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [url, setUrl] = useState(product.url);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const validateUrl = (value: string) => {
    const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!regex.test(value)) {
      return 'URL must use lowercase letters and hyphens only, no spaces.';
    }
    return '';
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const errorMsg = validateUrl(url);
  if (errorMsg) {
    setUrlError(errorMsg);
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('url', url);
    if (image) {
      formData.append('image', image);
    }

    const response = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: formData,
    });

    // First check if response has content
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update product');
    }

    if (!data.success) {
      throw new Error('Update operation failed');
    }

    toast.success('Product updated successfully!');
    router.refresh();
    onClose();
  } catch (error) {
    console.error('Update error:', error);
    toast.error(
      error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] min-h-screen flex items-center justify-center bg-black/50 px-4 sm:px-0"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative w-full max-w-md bg-zinc-900 text-white p-6 sm:p-8 rounded-xl shadow-xl z-[1000]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Edit Product</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product Name"
              required
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-sm sm:text-base"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
              className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-sm sm:text-base min-h-[100px]"
            />

            <div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError('');
                }}
                placeholder="Product URL (e.g. my-product-url)"
                required
                className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-sm sm:text-base"
              />
              {urlError && <p className="mt-1 text-red-400 text-sm">{urlError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Update Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                  id="product-image"
                  className="sr-only"
                />
                <label
                  htmlFor="product-image"
                  className="inline-block px-4 py-2 text-sm font-medium text-zinc-200 bg-zinc-700 hover:bg-zinc-600 rounded cursor-pointer"
                >
                  Choose New Image
                </label>
                {image && (
                  <p className="mt-2 text-xs text-zinc-400 truncate">
                    Selected: {image.name}
                  </p>
                )}
                {product.image_url && !image && (
                  <p className="mt-2 text-xs text-zinc-400">
                    Current image will be kept
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}