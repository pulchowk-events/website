import { TrendingUp, Users } from 'lucide-react';
import PrizePoolProgress from '@/app/components/donate/SmPrizePoolProgress';
import { getPrizePool } from '@/app/lib/queries';

export default async function LeftSidebar() {
  const prizePool = await getPrizePool();

  return (
    <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
      <div className="bg-card border border-border rounded-xl p-5 shadow-lg sticky top-24">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h2 className="text-xl font-semibold text-foreground">Community</h2>
        </div>
        <div className="space-y-4">
          <a
            href="https://discord.gg/cQ5gxusATk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-muted/30 hover:bg-accent transition-colors p-3 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 rounded-lg p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-foreground">Join Discord</span>
            </div>
            <span className="bg-muted rounded-full px-2.5 py-1 text-xs text-foreground">1,050+</span>
          </a>
          <div className="pt-2">
            <PrizePoolProgress
              currentAmount={prizePool.currentAmount}
              targetAmount={prizePool.targetAmount}
              totalDonors={prizePool.totalDonors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}