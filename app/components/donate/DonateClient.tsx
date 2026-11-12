"use client";

import { Session } from "next-auth";
import DonateForm from "./DonateForm";
import { DonateProgress } from "./DonateProgress";
import { VerifiedLedger } from "./VerifiedLedger";

interface Donator {
  id: number;
  name: string;
  amount: number;
  avatar_url: string | null;
}

interface PrizePool {
  current_amount: number;
  target_amount: number;
}

interface Props {
  session: Session | null;
  donators: Donator[];
  prizePool: PrizePool | null;
  verifiedLedger: Array<{
    id: string;
    name: string;
    amount: number;
    created_at: string;
    verified_at: string | null;
  }>;
}

export default function DonateClient({ session, prizePool, verifiedLedger }: Props) {
  return (
    <div className="donate-page">
      <DonateProgress
        current={prizePool?.current_amount || 0}
        target={prizePool?.target_amount || 100000}
        donors={verifiedLedger.length}
      />

      <div className="donate-layout">
        <div className="donate-layout__form">
          <DonateForm
            initialUserData={{
              name: session?.user?.name || "",
              email: session?.user?.email || "",
            }}
          />
        </div>

        <div className="donate-layout__ledger">
          <VerifiedLedger donations={verifiedLedger} />
        </div>
      </div>
    </div>
  );
}
