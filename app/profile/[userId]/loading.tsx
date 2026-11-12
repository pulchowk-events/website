import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="utility">
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 24, width: 180, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: 140 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 40, width: "100%", marginBottom: 16 }} />
      {[0,1,2].map((i) => (
        <div key={i} className="skeleton" style={{ height: 96, marginBottom: 4, borderRadius: 8 }} />
      ))}
    </Layout>
  );
}
