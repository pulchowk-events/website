interface Props {
  current: number;
  target: number;
  donors: number;
}

const MILESTONES = [25, 50, 75];

function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

export function DonateProgress({ current, target, donors }: Props) {
  const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0);
  return (
    <section className="donate-hero">
      <p className="donate-hero__eyebrow">Prize pool</p>
      <h2 className="donate-hero__amount">
        {fmt(current)} <span className="donate-hero__of">of {fmt(target)}</span>
      </h2>

      <div className="donate-progress" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="donate-progress__fill" style={{ width: pct + "%" }} />
        {MILESTONES.map((m) => (
          <span
            key={m}
            className={"donate-progress__tick" + (pct >= m ? " donate-progress__tick--passed" : "")}
            style={{ left: m + "%" }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="donate-hero__meta">
        <span>
          <strong>{donors.toLocaleString("en-US")}</strong> {donors === 1 ? "donor" : "donors"}
        </span>
        <span className="donate-hero__pct">{pct.toFixed(1)}% funded</span>
      </div>

      <p className="donate-hero__where">
        100% of donations fund student competitions and merit-based awards. No platform fee.
      </p>
    </section>
  );
}
