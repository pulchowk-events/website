import Link from "next/link";
import { SmartImg } from "@/app/components/ui/SmartImg";
import { RailWidget } from "./RailWidget";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  image_url: string | null;
}

export function NewJobsWidget({ jobs }: { jobs: Job[] }) {
  return (
    <RailWidget title="New jobs" action={{ href: "/jobs", label: "See all" }}>
      {jobs.length === 0 ? (
        <p className="rail-empty">No new jobs today.</p>
      ) : (
        <ul className="rail-mini-list">
          {jobs.map((j) => (
            <li key={j.id}>
              <Link href={"/jobs/" + j.id} className="rail-mini-row">
                <span className="rail-mini__thumb">
                  <SmartImg
                    src={j.image_url}
                    alt=""
                    seed={j.id}
                    fallback={<span className="rail-mini__thumb-initial">{(j.company || j.title || "?").charAt(0).toUpperCase()}</span>}
                  />
                </span>
                <span className="rail-mini__body">
                  <span className="rail-mini__title">{j.title}</span>
                  <span className="rail-mini__meta">
                    {j.company}{j.location ? " \u00b7 " + j.location : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </RailWidget>
  );
}
