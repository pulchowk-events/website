import Link from "next/link";
import { SmartImg } from "@/app/components/ui/SmartImg";
import { RailWidget } from "./RailWidget";

interface Project {
  id: number | string;
  name: string;
  url: string;
  description: string | null;
  image_url: string | null;
}

export function TopProjectsWidget({ projects }: { projects: Project[] }) {
  return (
    <RailWidget title="Top products" action={{ href: "/product-hunt", label: "See all" }}>
      {projects.length === 0 ? (
        <p className="rail-empty">No products yet.</p>
      ) : (
        <ul className="rail-mini-list">
          {projects.map((p, i) => (
            <li key={p.id}>
              <Link href={"/product-hunt/" + p.url} className="rail-mini-row">
                <span className="rail-mini__rank">{i + 1}</span>
                <span className="rail-mini__thumb">
                  <SmartImg
                    src={p.image_url}
                    alt=""
                    seed={String(p.id)}
                    fallback={<span className="rail-mini__thumb-initial">{(p.name || "?").charAt(0).toUpperCase()}</span>}
                  />
                </span>
                <span className="rail-mini__body">
                  <span className="rail-mini__title">{p.name}</span>
                  {p.description && <span className="rail-mini__meta">{p.description}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </RailWidget>
  );
}
