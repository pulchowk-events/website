import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="jobs">
      <div className="skeleton" style={{ height: 12, width: 60, marginBottom: 24 }} />
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 8 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 28, width: "60%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: "40%" }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 120, marginBottom: 20, borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
    </Layout>
  );
}
