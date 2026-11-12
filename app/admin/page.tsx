import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAdminOverview } from "@/app/lib/queries";
import { formatDateShort } from "@/app/lib/formatDate";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const o = await getAdminOverview();

  const tiles = [
    { label: "Verified events", value: o.totalEvents, href: "/admin/events" },
    { label: "Pending events", value: o.pendingEvents, href: "/admin/events" },
    { label: "Approved products", value: o.totalProducts, href: "/admin/products" },
    { label: "Pending products", value: o.pendingProducts, href: "/admin/products" },
    { label: "Users", value: o.totalUsers, href: "/admin/admins" },
    { label: "Open reports", value: o.openReports, href: "/admin/reports" },
  ];

  return (
    <div className="admin-overview">
      <dl className="admin-stats">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="admin-stat admin-stat--link">
            <dd className="admin-stat__value">{t.value.toLocaleString("en-US")}</dd>
            <dt className="admin-stat__label">{t.label}</dt>
          </Link>
        ))}
      </dl>

      <section className="admin-panel">
        <header className="admin-panel__head">
          <h2 className="admin-panel__title">Recent verified donations</h2>
          <p className="admin-panel__desc">The five most recently verified contributions.</p>
        </header>
        <div className="admin-panel__body">
          {o.recentDonations.length === 0 ? (
            <p className="admin-empty">No verified donations yet.</p>
          ) : (
            <ul className="admin-recent">
              {o.recentDonations.map((d: any) => (
                <li key={d.id} className="admin-recent__row">
                  <span className="admin-recent__name">{d.name || "Anonymous"}</span>
                  <span className="admin-recent__meta">
                    {d.verified_at ? formatDateShort(d.verified_at) : "—"}
                  </span>
                  <span className="admin-recent__amount">
                    ${d.amount.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/donations" className="admin-recent__more">
            All donations <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      <section className="admin-panel">
        <header className="admin-panel__head">
          <h2 className="admin-panel__title">Moderation queue</h2>
          <p className="admin-panel__desc">What needs your attention right now.</p>
        </header>
        <div className="admin-panel__body admin-queue">
          <Link href="/admin/events" className="admin-queue__item">
            <span className="admin-queue__count">{o.pendingEvents}</span>
            <span className="admin-queue__label">pending events</span>
            <ArrowRight size={12} />
          </Link>
          <Link href="/admin/products" className="admin-queue__item">
            <span className="admin-queue__count">{o.pendingProducts}</span>
            <span className="admin-queue__label">pending products</span>
            <ArrowRight size={12} />
          </Link>
          <Link href="/admin/reports" className="admin-queue__item">
            <span className="admin-queue__count">{o.openReports}</span>
            <span className="admin-queue__label">open reports</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>
    </div>
  );
}
