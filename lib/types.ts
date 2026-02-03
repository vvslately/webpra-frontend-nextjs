export interface Product {
  id: number;
  name: string;
  subtitle: string | null;
  image: string | null;
  price: string;
  delivery_method: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface Review {
  id: number;
  author_name: string;
  content: string;
  rating: number | null;
  product_id: number | null;
  created_at: Date | string | null;
}
