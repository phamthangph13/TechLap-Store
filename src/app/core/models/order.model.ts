export interface Order {
  _id?: string;
  orderNumber?: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
  };
  items: OrderItem[];
  payment: {
    method: string;
    status: string;
  };
  productInfo?: ProductInfo[];
  subtotal: number;
  discountTotal?: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  orderDate?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  basePrice?: number;
  variantName?: string;
  variantSpecs?: {
    cpu?: string;
    ram?: string;
    storage?: string;
    display?: string;
    gpu?: string;
    battery?: string;
    os?: string;
    ports?: string[];
  };
  variantPrice?: number;
  variantDiscountPercent?: number;
  colorName?: string;
  colorCode?: string;
  colorPriceAdjustment?: number;
  colorDiscountAdjustment?: number;
  quantity: number;
  unitPrice?: number;
  discountedPrice?: number;
  subtotal: number;
  thumbnailUrl?: string;
}

export interface ProductInfo {
  title: string;
  content: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order | Order[] | OrderStatistics;
  pagination?: Pagination;
  errors?: string[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface OrderStatistics {
  total_orders: number;
  orders_by_status: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  total_sales: number;
  recent_orders: number;
}

export interface OrderPlacement {
  customerId?: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
  };
  items: {
    productId: string;
    variantId?: string;
    colorId?: string;
    quantity: number;
  }[];
  payment: {
    method: string;
  };
} 