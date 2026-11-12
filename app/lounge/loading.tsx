import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="lounge">
      <div className="skeleton" style={{ height: 32, width: 100, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 44, width: "100%", marginBottom: 16, borderRadius: 8 }} />
      {[0,1,2,3,4].map((i) => (
        <div key={i} className="skeleton" style={{ height: 96, marginBottom: 4, borderRadius: 8 }} />
      ))}
    </Layout>
  );
}
