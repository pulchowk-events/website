import AdminReports from "@/app/components/admin/AdminReports";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <section className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="admin-panel__title">Reports</h2>
        <p className="admin-panel__desc">Review and act on reported content.</p>
      </header>
      <div className="admin-panel__body"><AdminReports /></div>
    </section>
  );
}
