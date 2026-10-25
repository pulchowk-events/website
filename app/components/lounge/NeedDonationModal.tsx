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
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" aria-hidden="true" />

        <div className="relative bg-popover border border-border rounded-xl w-full max-w-md shadow-2xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Help Us Grow! 🌱</h3>
            <p className="text-muted-foreground mb-6">
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
                className="bg-secondary hover:bg-accent text-secondary-foreground px-6 py-2 rounded-lg"
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