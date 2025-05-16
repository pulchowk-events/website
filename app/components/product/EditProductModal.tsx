'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditProductModalProps {
  product: {
    id: number;
    name: string;
    description: string;
    url: string;
    image_url: string | null;
    redirect_url: string | null;
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
  const [redirectUrl, setRedirectUrl] = useState(product.redirect_url || '');



    // Add the same URL validation as in AddProductModal
  const validateRedirectUrl = (value: string) => {
    if (!value) return '';
    try {
      new URL(value);
      return '';
    } catch {
      return 'Please enter a valid URL (including http:// or https://)';
    }
  };

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
    formData.append('redirect_url', redirectUrl);
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
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative w-full max-w-md bg-black/90  text-white overflow-hidden">
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
              <CardDescription>Update your product details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Product Name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description"
                    required
                    className="w-full p-3 rounded bg-zinc-800 border border-zinc-800 text-sm min-h-[100px]"
                  />
                </div>

                
                                <div className="space-y-1.5">
                    <Label htmlFor="redirect-url">View Product URL (Optional)</Label>
                    <Input
                      id="redirect-url"
                      type="url"
                      value={redirectUrl}
                      onChange={(e) => setRedirectUrl(e.target.value)}
                      placeholder="https://your-product-url.com"
                    />
                    <p className="text-xs text-zinc-400">
                      Add a link to your product's website or repository
                    </p>
            </div>

                <div className="space-y-1.5">
                  <Label htmlFor="url">Product Slug</Label>
                  <Input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) setUrlError('');
                    }}
                    placeholder="e.g. my-product-url"
                    required
                  />
                  {urlError && (
                    <p className="text-sm text-red-400">{urlError}</p>
                  )}
                </div>


                <div className="space-y-1.5">
                  <Label htmlFor="product-image">Update Image</Label>
                  <Input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                  />
                  {image && (
                    <p className="text-sm text-zinc-400 truncate">
                      Selected: {image.name}
                    </p>
                  )}
                  {product.image_url && !image && (
                    <p className="text-sm text-zinc-400">
                      Current image will be kept
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </form>
            </CardContent>
            <BorderBeam duration={8} size={120} />
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}