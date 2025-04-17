// types/product.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  votes: number;
  created_at: string;
  approved: boolean;
}

export interface Vote {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
}