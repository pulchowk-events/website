'use client';

import { Session } from 'next-auth';
import DonateForm from '@/app/components/donate/DonateForm';
import TopDonators from '@/app/components/donate/TopDonators';

interface Donator {
  id: number;
  name: string;
  amount: number;
  avatar_url: string | null;
}


interface PrizePool {
  current_amount: number;
  target_amount: number;
}

interface DonateClientProps {
  session: Session | null;
  donators: Donator[];
  prizePool: PrizePool | null;
}

export default function DonateClient({ session, donators, prizePool }: DonateClientProps) {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 border-x dotted-border-vertical">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Support Future Investors</h1>
        <p className="text-zinc-400 md:text-lg max-w-3xl">
          Your contribution helps students learn real-world investing skills and provides funding for promising projects.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <DonateForm initialUserData={{
            name: session?.user?.name || '',
            email: session?.user?.email || ''
          }} />
        </div>

        <div>
          <TopDonators donators={donators} limit={5} />
          <div className="bg-zinc-800/50 rounded-lg shadow-lg border border-zinc-800/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">About The Prize Pool</h3>
            <p className="text-zinc-300 mb-3">
              The prize pool funds educational investing competitions and provides seed capital for student projects.
            </p>
            <p className="text-zinc-300 mb-3">
              100% of donations go directly to students through competitive challenges and merit-based awards.
            </p>
            <div className="mt-6 pt-6 border-t border-zinc-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">Current pool:</span>
                <span className="text-xl font-bold text-white">
                  ${(prizePool?.current_amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Target goal:</span>
                <span className="text-lg text-zinc-300">
                  ${(prizePool?.target_amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
