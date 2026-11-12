import AdminNotificationAdder from "@/app/components/admin/AdminNotificationAdder";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <section className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="admin-panel__title">Broadcast notification</h2>
        <p className="admin-panel__desc">Send a notification to every user.</p>
      </header>
      <div className="admin-panel__body"><AdminNotificationAdder /></div>
    </section>
  );
}
