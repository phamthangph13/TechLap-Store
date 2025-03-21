export interface ProductSpecs {
  cpu: string;
  ram: string;
  storage: string;
  display: string;
  gpu: string;
  battery: string;
  os: string;
  ports: string[];
}

export interface Product {
  _id?: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  discount_percent: number;
  discount_price?: number;
  stock_quantity: number;
  status?: 'available' | 'sold_out' | 'discontinued';
  category_ids?: string[];
  thumbnail?: string;
  images?: string[];
  videos?: string[];
  specs: ProductSpecs;
  created_at?: string;
  updated_at?: string;
} 