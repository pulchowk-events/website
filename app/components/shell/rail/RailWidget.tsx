import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
}

export function RailWidget({ title, action, children }: Props) {
  return (
    <section className="rail-w">
      <header className="rail-w__head">
        <h2 className="rail-w__title">{title}</h2>
        {action && <Link href={action.href} className="rail-w__action">{action.label}</Link>}
      </header>
      <div className="rail-w__body">{children}</div>
    </section>
  );
}
