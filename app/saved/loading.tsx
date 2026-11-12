import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="utility">
      <div className="skeleton" style={{ height: 32, width: 90, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 36, width: 400, marginBottom: 16 }} />
      {[0,1,2,3,4].map((i) => (
        <div key={i} className="skeleton" style={{ height: 96, marginBottom: 4, borderRadius: 8 }} />
      ))}
    </Layout>
  );
}
