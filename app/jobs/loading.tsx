import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="jobs">
      <div className="skeleton" style={{ height: 32, width: 100, marginBottom: 20 }} />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 8 }} />
        <div>
          {[0,1,2,3,4,5,6,7].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, marginBottom: 4, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
