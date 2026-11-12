import { Check } from "lucide-react";
import { formatDateShort } from "@/app/lib/formatDate";

interface Donation {
  id: string;
  name: string;
  amount: number;
  created_at: string;
  verified_at: string | null;
}

export function VerifiedLedger({ donations }: { donations: Donation[] }) {
  return (
    <section className="donate-ledger">
      <header className="donate-ledger__head">
        <h2 className="donate-ledger__title">Verified donations</h2>
        <p className="donate-ledger__desc">Every verified donation, newest first.</p>
      </header>

      {donations.length === 0 ? (
        <p className="donate-ledger__empty">No verified donations yet. Be the first.</p>
      ) : (
        <ul className="donate-ledger__list">
          {donations.map((d) => (
            <li key={d.id} className="donate-ledger__row">
              <span className="donate-ledger__badge">
                <Check size={10} />
              </span>
              <span className="donate-ledger__name">{d.name || "Anonymous"}</span>
              <span className="donate-ledger__date">{formatDateShort(d.verified_at || d.created_at)}</span>
              <span className="donate-ledger__amount">${d.amount.toLocaleString("en-US")}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
