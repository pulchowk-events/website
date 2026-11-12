import { RailWidget } from "./RailWidget";
import { formatDateShort } from "@/app/lib/formatDate";

interface Supporter {
  id: string;
  name: string;
  amount: number;
  created_at: string;
}

export function RecentSupportersWidget({ supporters }: { supporters: Supporter[] }) {
  return (
    <RailWidget title="Recent supporters" action={{ href: "/donate", label: "All" }}>
      {supporters.length === 0 ? (
        <p className="rail-empty">No supporters yet.</p>
      ) : (
        <ul className="rail-donors">
          {supporters.map((s) => (
            <li key={s.id} className="rail-donor">
              <span className="rail-donor__name">{s.name || "Anonymous"}</span>
              <span className="rail-donor__amount">${s.amount.toLocaleString("en-US")}</span>
            </li>
          ))}
        </ul>
      )}
    </RailWidget>
  );
}
