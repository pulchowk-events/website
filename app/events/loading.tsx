import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="events">
      <div className="skeleton" style={{ height: 32, width: 120, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 32, width: "100%", maxWidth: 480, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 32, width: "100%", marginBottom: 16 }} />
      {[0,1,2,3,4,5].map((i) => (
        <div key={i} className="skeleton" style={{ height: 88, marginBottom: 4, borderRadius: 8 }} />
      ))}
    </Layout>
  );
}
