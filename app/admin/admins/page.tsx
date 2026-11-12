import AdminUserForm from "@/app/components/admin/AdminUserForm";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <section className="admin-panel">
      <header className="admin-panel__head">
        <h2 className="admin-panel__title">Manage admins</h2>
        <p className="admin-panel__desc">Add or remove administrator privileges.</p>
      </header>
      <div className="admin-panel__body"><AdminUserForm /></div>
    </section>
  );
}
