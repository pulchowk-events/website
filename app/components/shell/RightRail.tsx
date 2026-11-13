import type { RailBundle } from "@/app/lib/queries";
import { PrizePoolWidget } from "./rail/PrizePoolWidget";
import { TopDonorsWidget } from "./rail/TopDonorsWidget";
import { TrendingWidget } from "./rail/TrendingWidget";
import { UpcomingEventsWidget } from "./rail/UpcomingEventsWidget";
import { RecentSupportersWidget } from "./rail/RecentSupportersWidget";
import { TopProjectsWidget } from "./rail/TopProjectsWidget";
import { NewJobsWidget } from "./rail/NewJobsWidget";

interface Props {
  bundle: RailBundle;
  hiddenWidgets: string[];
}

export function RightRail({ bundle, hiddenWidgets }: Props) {
  const hide = new Set(hiddenWidgets);
  const show = (key: string) => !hide.has(key);

  return (
    <aside className="rail" aria-label="Contextual">
      {show("prizePool") && bundle.prizePool && (
        <PrizePoolWidget
          current={bundle.prizePool.currentAmount}
          target={bundle.prizePool.targetAmount}
          donors={bundle.prizePool.totalDonors}
        />
      )}
      {show("topProjects") && bundle.topProjects && (
        <TopProjectsWidget projects={bundle.topProjects} />
      )}
      {show("trending") && bundle.trending && (
        <TrendingWidget posts={bundle.trending} />
      )}
      {show("upcomingEvents") && bundle.upcomingEvents && (
        <UpcomingEventsWidget events={bundle.upcomingEvents} />
      )}
      {show("newJobs") && bundle.newJobs && (
        <NewJobsWidget jobs={bundle.newJobs} />
      )}
      {show("topDonors") && bundle.topDonors && (
        <TopDonorsWidget donors={bundle.topDonors} />
      )}
      {show("recentSupporters") && bundle.recentSupporters && (
        <RecentSupportersWidget supporters={bundle.recentSupporters} />
      )}
    </aside>
  );
}
