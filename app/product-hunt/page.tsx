// app/product-hunt/page.tsx
import Layout from '@/app/components/layout/Layout';
import ProductHuntClient from './ProductHuntClient';

export const dynamic = 'force-dynamic';

export default async function ProductHuntPage() {
  let products = [];
  let userId = null;
  
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/products/approved`, {
      next: { revalidate: 60 } // Optional: Revalidate every 60 seconds
    });

    if (response.ok) {
      const data = await response.json();
      products = data.products;
      userId = data.userId;
    } else {
      console.error('Failed to fetch products:', response.status);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <Layout>
      <ProductHuntClient
        products={products}
        userId={userId}
      />
    </Layout>
  );
}