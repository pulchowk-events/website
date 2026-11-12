import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="projects">
      <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 24 }} />
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 96, height: 96, borderRadius: 8 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 30, width: "60%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: "80%" }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 40, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />
    </Layout>
  );
}
