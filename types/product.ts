interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  votes: number;
  created_at: string;
  approved: boolean;
  posted_by: string;
}

export interface Vote {
  id: number;
  user_id: string;
  product_id: number;
  type: 'upvote' | 'downvote';
  created_at: string;
}
