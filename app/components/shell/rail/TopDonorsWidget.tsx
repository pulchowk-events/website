import { RailWidget } from "./RailWidget";

interface Donor {
  id: number;
  name: string;
  amount: number;
  avatar_url: string | null;
}

export function TopDonorsWidget({ donors }: { donors: Donor[] }) {
  return (
    <RailWidget title="Top donors" action={{ href: "/donate", label: "All" }}>
      {donors.length === 0 ? (
        <p className="rail-empty">No donors yet.</p>
      ) : (
        <ol className="rail-donors">
          {donors.map((d, i) => (
            <li key={d.id} className="rail-donor">
              <span className="rail-donor__rank">{i + 1}</span>
              <span className="rail-donor__name">{d.name}</span>
              <span className="rail-donor__amount">${d.amount.toLocaleString("en-US")}</span>
            </li>
          ))}
        </ol>
      )}
    </RailWidget>
  );
}
