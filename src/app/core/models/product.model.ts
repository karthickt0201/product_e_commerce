export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  description: string;
}

export interface ProductQuery {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: keyof Product;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Live stock tick emitted by the simulated WebSocket stream. */
export interface StockTick {
  productId: number;
  stock: number;
}
