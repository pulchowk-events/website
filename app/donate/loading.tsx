import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="donate">
      <div className="skeleton" style={{ height: 32, width: 100, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 160, marginBottom: 16, borderRadius: 8 }} />
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 8 }} />
      </div>
    </Layout>
  );
}
