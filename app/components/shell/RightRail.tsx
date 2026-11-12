import type { RailBundle } from "@/app/lib/queries";
import { CommunityWidget } from "./rail/CommunityWidget";
import { PrizePoolWidget } from "./rail/PrizePoolWidget";
import { TopDonorsWidget } from "./rail/TopDonorsWidget";

export function RightRail({ bundle }: { bundle: RailBundle }) {
  return (
    <aside className="rail" aria-label="Contextual">
      {bundle.context === "home" && (
        <>
          <CommunityWidget discordUrl={bundle.community.discordUrl} />
          <PrizePoolWidget
            current={bundle.prizePool.currentAmount}
            target={bundle.prizePool.targetAmount}
            donors={bundle.prizePool.totalDonors}
          />
          <TopDonorsWidget donors={bundle.topDonors} />
        </>
      )}
      {bundle.context === "utility" && (
        <>
          <CommunityWidget discordUrl={bundle.community.discordUrl} />
          <PrizePoolWidget
            current={bundle.prizePool.currentAmount}
            target={bundle.prizePool.targetAmount}
            donors={bundle.prizePool.totalDonors}
          />
        </>
      )}
      {bundle.context !== "home" && bundle.context !== "utility" && (
        <>
          <CommunityWidget discordUrl="https://discord.gg/cQ5gxusATk" />
          {"prizePool" in bundle && bundle.prizePool && (
            <PrizePoolWidget
              current={bundle.prizePool.currentAmount}
              target={bundle.prizePool.targetAmount}
              donors={bundle.prizePool.totalDonors}
            />
          )}
        </>
      )}
    </aside>
  );
}
