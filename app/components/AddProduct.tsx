'use client';

import { Button } from '@/components/ui/button';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AddProduct() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (!session) {
      signIn('discord');
    } else {
      router.push('/?showAddProduct=true');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full sm:w-auto"
    >
      <Button
        className="w-full sm:w-auto bg-green-700 hover:bg-green-800"
        onClick={handleClick}
      >
        Add Product
      </Button>
    </motion.div>
  );
}
