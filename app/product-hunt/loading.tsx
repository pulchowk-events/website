import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="projects">
      <div className="skeleton" style={{ height: 32, width: 120, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 32, width: 240, marginBottom: 16 }} />
      {[0,1,2,3].map((i) => (
        <div key={i} className="skeleton" style={{ height: 88, marginBottom: 4, borderRadius: 8 }} />
      ))}
    </Layout>
  );
}
