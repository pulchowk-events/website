'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function AdminProductForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const isSquare = img.width === img.height;
        URL.revokeObjectURL(url);
        resolve(isSquare);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      
      img.src = url;
    });
  };

  const handleImageUpload = async () => {
    if (!image) return null;
    
    // Check image size
    const imageSize = image.size / 1024; // Convert bytes to KB
    if (imageSize > 100) {
      toast.error('Image size must be less than 100 KB. SVG is recommended.');
      return null;
    }
    
    // Check aspect ratio
    const isSquare = await checkImageDimensions(image);
    if (!isSquare) {
      toast.error('Image must have a 1:1 aspect ratio (square).');
      return null;
    }

    // Upload to product_bucket
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(`${Date.now()}_${image.name}`, image, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      toast.error('Failed to upload image.');
      return null;
    }

    // Get the public URL for the uploaded image
    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.url) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload image if selected
      const imagePath = image ? await handleImageUpload() : null;
      
      if (image && !imagePath) {
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('products')
        .insert([
          { 
            name: formData.name,
            description: formData.description,
            url: formData.url,
            image_url: imagePath,
            posted_by: session?.user?.id || null,
            approved: true,
            votes: 0
          }
        ]);
        
      if (error) {
        console.error('Error adding product:', error);
        toast.error('Failed to add product');
        return;
      }
      
      toast.success('Product added successfully');
      setFormData({
        name: '',
        description: '',
        url: '',
      });
      setImage(null);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2"
            required
          />
        </div>
        
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-zinc-300 mb-2">
            Product URL *
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full bg-zinc-700 border-transparent rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 text-zinc-100 px-4 py-2 resize-y"
          required
        />
      </div>
      
<div>
  <label className="block text-sm font-medium text-zinc-300 mb-2">Product Image</label>
  
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
      Upload Image
    </label>

    {image && (
      <p className="mt-2 text-xs text-zinc-400 truncate">
        Selected: {image.name}
      </p>
    )}
  </div>
</div>

      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <span className="mr-2">Adding...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            </>
          ) : (
            'Add Product'
          )}
        </button>
      </div>
    </form>
  );
}