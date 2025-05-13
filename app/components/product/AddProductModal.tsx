'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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


interface AddProductModalProps {
  onClose: () => void;
}

interface ApiError {
  error?: string;
  message?: string;
}

export default function AddProductModal({ onClose }: AddProductModalProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
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
      return 'Url must use lowercase letters and hyphens only, no spaces.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error('You must be signed in to submit.');
      router.push('/api/auth/signin');
      return;
    }

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

      const response = await fetch('/api/products/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit product');
      }

      toast.success(result.message || 'Product submitted for review!');
      setName('');
      setDescription('');
      setUrl('');
      setImage(null);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      
      // Type-safe error handling
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === 'string') {
        toast.error(error);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

return (
  <AnimatePresence>
    <motion.div
      key="modal"
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
        <Card className="relative w-full max-w-md bg-black/90 text-white overflow-hidden">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>Submit your product for daily listing.</CardDescription>
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
                  className="w-full p-3 rounded bg-zinc-800 border border-zinc-800 text-sm"
                />
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
                  placeholder=".com/product-hunt/{your-slug}"
                  required
                />
                {urlError && (
                  <p className="text-sm text-red-400">{urlError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-image">Product Image</Label>
                <Input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImage(e.target.files ? e.target.files[0] : null)
                  }
                />
                {image && (
                  <p className="text-sm text-zinc-400 truncate">
                    Selected: {image.name}
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
                  {loading ? 'Submitting...' : 'Submit'}
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