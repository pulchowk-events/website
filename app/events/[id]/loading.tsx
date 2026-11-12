import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="events">
      <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 30, width: 200, marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,280px) 1fr", gap: 24 }}>
        <div className="skeleton" style={{ aspectRatio: "4/5", borderRadius: 8 }} />
        <div>
          <div className="skeleton" style={{ height: 36, width: "60%", marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 20, width: "100%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 20, width: "80%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 20, width: "70%" }} />
        </div>
      </div>
    </Layout>
  );
}
