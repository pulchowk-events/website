// app/about/page.tsx
import Layout from "../components/layout/Layout";

export default function About() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-6">About Pulchowk Events</h1>
        <div className="prose prose-invert max-w-none">
          <p>
            Pulchowk Events is a platform to discover and share all the exciting events happening
            across Nepal&apos;s educational institutions.
          </p>
          <p>
            Our Product Hunt section allows students to showcase their projects and get feedback
            from the community.
          </p>
        </div>
      </div>
    </Layout>
  );
}