import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="utility">
      <div className="skeleton" style={{ height: 32, width: 80, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 40, width: 480, marginBottom: 20 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {[0,1,2,3,4,5].map((i) => (
          <div key={i} className="skeleton" style={{ height: 140, borderRadius: 8 }} />
        ))}
      </div>
    </Layout>
  );
}
