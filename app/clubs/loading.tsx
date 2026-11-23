import Layout from "@/app/components/layout/Layout";

export default function Loading() {
  return (
    <Layout>
      <div className="club-feed">
        <div className="skeleton" style={{ height: 32, width: 120, marginBottom: 20 }} />
        <div className="club-rail" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ width: 56, height: 56, borderRadius: "50%", flex: "none" }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 32, width: 160, marginBottom: 16 }} />
        <div className="club-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: "4 / 5", borderRadius: 12 }} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
