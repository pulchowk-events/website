'use client';

import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NeedDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NeedDonationModal({ isOpen, onClose }: NeedDonationModalProps) {
  const router = useRouter();

  const handleDonate = () => {
    router.push('/donate');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-[60] overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Title className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="relative bg-zinc-900 rounded-xl w-full max-w-md shadow-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Help Us Grow! 🌱</h3>
            <p className="text-zinc-300 mb-6">
              Since this is a student initiative, we don't have enough resources to implement all features. 
              Please consider donating so we can bring upgrades to this community.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDonate}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Donate
              </button>
              <button
                onClick={onClose}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}