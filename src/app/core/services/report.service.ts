import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopSellingProduct {
  product_id: string;
  name: string;
  brand: string;
  total_sales: number;
  total_revenue: number;
  current_stock: number;
}

export interface CategoryStatistics {
  category_id: string;
  name: string;
  total_products: number;
  total_sales: number;
  total_revenue: number;
}

export interface InventoryStatusSummary {
  total_products: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  in_stock_count: number;
}

export interface InventoryProduct {
  product_id: string;
  name: string;
  brand: string;
  current_stock: number;
  status: string;
}

export interface InventoryStatus {
  summary: InventoryStatusSummary;
  low_stock_products: InventoryProduct[];
  out_of_stock_products: InventoryProduct[];
}

export interface ProductSalesTrend {
  period: string;
  products: {
    product_id: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = '/api/product-statistics';

  constructor(private http: HttpClient) { }

  getTopSellingProducts(params: {
    period?: string,
    start_date?: string,
    end_date?: string,
    year?: number,
    month?: number,
    limit?: number,
    category_id?: string
  } = {}): Observable<{success: boolean, message: string, data: TopSellingProduct[]}> {
    return this.http.get<{success: boolean, message: string, data: TopSellingProduct[]}>(
      `${this.apiUrl}/top-selling`, { params: params as any }
    );
  }

  getProductStatisticsByCategory(params: {
    period?: string,
    start_date?: string,
    end_date?: string,
    year?: number,
    month?: number,
    limit?: number
  } = {}): Observable<{success: boolean, message: string, data: CategoryStatistics[]}> {
    return this.http.get<{success: boolean, message: string, data: CategoryStatistics[]}>(
      `${this.apiUrl}/by-category`, { params: params as any }
    );
  }

  getInventoryStatus(): Observable<{success: boolean, message: string, data: InventoryStatus}> {
    return this.http.get<{success: boolean, message: string, data: InventoryStatus}>(
      `${this.apiUrl}/inventory-status`
    );
  }

  getProductSalesTrends(params: {
    period?: string,
    start_date?: string,
    end_date?: string,
    year?: number,
    month?: number,
    limit?: number,
    category_id?: string
  } = {}): Observable<{success: boolean, message: string, data: ProductSalesTrend[]}> {
    return this.http.get<{success: boolean, message: string, data: ProductSalesTrend[]}>(
      `${this.apiUrl}/sales-trends`, { params: params as any }
    );
  }
}
