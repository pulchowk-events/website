import Layout from "@/app/components/layout/Layout";
export default function Loading() {
  return (
    <Layout railContext="lounge">
      <div className="skeleton" style={{ height: 12, width: 70, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 30, width: "70%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 16, width: 200, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 40, width: "100%", marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 240, borderRadius: 8 }} />
    </Layout>
  );
}
