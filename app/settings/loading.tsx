import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="utility">
      <div className="skeleton" style={{ height: 32, width: 120, marginBottom: 20 }} />
      {[0,1,2].map((i) => (
        <div key={i} className="skeleton" style={{ height: 200, marginBottom: 16, borderRadius: 8 }} />
      ))}
    </Layout>
  );
}
