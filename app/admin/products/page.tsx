import PendingProducts from "@/app/components/admin/PendingProducts";
import AdminProductForm from "@/app/components/admin/AdminProductForm";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <details className="admin-panel">
        <summary className="admin-panel__head" style={{ cursor: "pointer" }}>
          <h2 className="admin-panel__title">Add product directly</h2>
          <p className="admin-panel__desc">Insert an already-approved project without going through review.</p>
        </summary>
        <div className="admin-panel__body"><AdminProductForm /></div>
      </details>
      <section className="admin-panel">
        <header className="admin-panel__head">
          <h2 className="admin-panel__title">Pending products</h2>
          <p className="admin-panel__desc">Review and approve or reject submitted projects.</p>
        </header>
        <div className="admin-panel__body"><PendingProducts /></div>
      </section>
    </div>
  );
}
