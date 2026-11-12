import Link from "next/link";
import { RailWidget } from "./RailWidget";

interface Props {
  current: number;
  target: number;
  donors: number;
}

function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

export function PrizePoolWidget({ current, target, donors }: Props) {
  const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0);
  return (
    <RailWidget title="Prize pool" action={{ href: "/donate", label: "Donate" }}>
      <p className="rail-pool__amount">
        {fmt(current)} <span className="rail-pool__of">of {fmt(target)}</span>
      </p>
      <div className="rail-pool__bar">
        <span style={{ width: pct + "%" }} />
      </div>
      <p className="rail-pool__meta">{donors} {donors === 1 ? "donor" : "donors"}</p>
    </RailWidget>
  );
}
