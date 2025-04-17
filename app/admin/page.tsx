import AdminProductForm from '../components/AdminProductForm';
import AdminUserForm from '../components/AdminUserForm';
import Layout from '../components/layout/Layout';

export default async function AdminPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        {/* Admin Product Form */}
        <div className="space-y-8 mb-12">
          <AdminProductForm />
        </div>

        {/* Admin User Form */}
        <div className="space-y-8">
          <AdminUserForm />
        </div>
      </div>
    </Layout>
  );
}
