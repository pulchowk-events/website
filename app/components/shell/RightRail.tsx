import type { RailBundle } from "@/app/lib/queries";
import { CommunityWidget } from "./rail/CommunityWidget";
import { PrizePoolWidget } from "./rail/PrizePoolWidget";
import { TopDonorsWidget } from "./rail/TopDonorsWidget";
import { TrendingWidget } from "./rail/TrendingWidget";
import { UpcomingEventsWidget } from "./rail/UpcomingEventsWidget";
import { RecentSupportersWidget } from "./rail/RecentSupportersWidget";

interface Props {
  bundle: RailBundle;
  hiddenWidgets: string[];
}

export function RightRail({ bundle, hiddenWidgets }: Props) {
  const hide = new Set(hiddenWidgets);
  const show = (key: string) => !hide.has(key);

  return (
    <aside className="rail" aria-label="Contextual">
      {bundle.context === "home" && (
        <>
          {show("community") && <CommunityWidget discordUrl={bundle.community.discordUrl} />}
          {show("prizePool") && (
            <PrizePoolWidget
              current={bundle.prizePool.currentAmount}
              target={bundle.prizePool.targetAmount}
              donors={bundle.prizePool.totalDonors}
            />
          )}
          {show("topDonors") && <TopDonorsWidget donors={bundle.topDonors} />}
        </>
      )}

      {bundle.context === "lounge" && (
        <>
          {show("trending") && <TrendingWidget posts={bundle.trending} />}
          {show("upcomingEvents") && <UpcomingEventsWidget events={bundle.upcomingEvents} />}
          {show("prizePool") && (
            <PrizePoolWidget
              current={bundle.prizePool.currentAmount}
              target={bundle.prizePool.targetAmount}
              donors={bundle.prizePool.totalDonors}
            />
          )}
        </>
      )}

      {bundle.context === "donate" && (
        <>
          {show("topDonors") && <TopDonorsWidget donors={bundle.topDonors} />}
          {show("recentSupporters") && <RecentSupportersWidget supporters={bundle.recentSupporters} />}
        </>
      )}

      {bundle.context === "utility" && (
        <>
          {show("community") && <CommunityWidget discordUrl={bundle.community.discordUrl} />}
          {show("prizePool") && (
            <PrizePoolWidget
              current={bundle.prizePool.currentAmount}
              target={bundle.prizePool.targetAmount}
              donors={bundle.prizePool.totalDonors}
            />
          )}
        </>
      )}

      {bundle.context !== "home" && bundle.context !== "lounge" && bundle.context !== "donate" && bundle.context !== "utility" && (
        <>
          {show("community") && <CommunityWidget discordUrl="https://discord.gg/cQ5gxusATk" />}
          {"prizePool" in bundle && bundle.prizePool && show("prizePool") && (
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
