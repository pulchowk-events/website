import Link from "next/link";
import { RailWidget } from "./RailWidget";

interface Trending {
  id: string;
  title: string;
  score: number | null;
  comment_count: number | null;
}

export function TrendingWidget({ posts }: { posts: Trending[] }) {
  return (
    <RailWidget title="Trending" action={{ href: "/lounge", label: "All" }}>
      {posts.length === 0 ? (
        <p className="rail-empty">Nothing trending this week.</p>
      ) : (
        <ol className="rail-list">
          {posts.map((p, i) => (
            <li key={p.id}>
              <Link href={"/lounge/" + p.id} className="rail-list__row">
                <span className="rail-list__rank">{i + 1}</span>
                <span className="rail-list__title">{p.title}</span>
                <span className="rail-list__meta">{p.comment_count ?? 0}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </RailWidget>
  );
}
