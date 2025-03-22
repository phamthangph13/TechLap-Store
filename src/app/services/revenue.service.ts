import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Revenue statistics data structure returned by the API
 */
export interface RevenueStatistics {
  period: string;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
}

/**
 * Revenue summary data structure returned by the API
 */
export interface RevenueSummary {
  today: {
    revenue: number;
    orders: number;
  };
  this_month: {
    revenue: number;
    orders: number;
    avg_order_value: number;
  };
  prev_month: {
    revenue: number;
    orders: number;
  };
  this_year: {
    revenue: number;
    orders: number;
    avg_order_value: number;
  };
  growth: {
    month_over_month: number;
    month_name: string;
  };
  top_products: {
    productId: string;
    productName: string;
    total_revenue: number;
    quantity_sold: number;
  }[];
}

/**
 * Product revenue data structure returned by the API
 */
export interface ProductRevenue {
  productId: string;
  productName: string;
  total_revenue: number;
  quantity_sold: number;
  avg_price: number;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Supported time periods for revenue data
 */
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

/**
 * Parameters for API requests
 */
export interface RevenueParams {
  start_date?: string;
  end_date?: string;
  year?: number;
  month?: number;
}

/**
 * Service for fetching revenue data from the backend API
 */
@Injectable({
  providedIn: 'root'
})
export class RevenueService {
  // API URL
  private baseUrl = '/api/revenue';

  constructor(private http: HttpClient) {}

  /**
   * Get revenue statistics for a specific time period
   * @param period The time period (daily, weekly, monthly, yearly, custom)
   * @param params Additional parameters required for the period
   * @returns Observable of revenue statistics
   */
  getRevenueStatistics(period: TimePeriod = 'monthly', params: RevenueParams = {}): Observable<ApiResponse<RevenueStatistics[]>> {
    const httpParams = this.buildParams(period, params);
    const url = `${this.baseUrl}/statistics`;
    
    return this.http.get<ApiResponse<RevenueStatistics[]>>(url, { params: httpParams })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Get a comprehensive summary of revenue metrics
   * @returns Observable of revenue summary data
   */
  getRevenueSummary(): Observable<ApiResponse<RevenueSummary>> {
    const url = `${this.baseUrl}/summary`;
    
    return this.http.get<ApiResponse<RevenueSummary>>(url)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Get revenue statistics broken down by product
   * @param period The time period (daily, weekly, monthly, yearly, custom)
   * @param params Additional parameters required for the period
   * @returns Observable of product revenue data
   */
  getRevenueByProduct(period: TimePeriod = 'monthly', params: RevenueParams = {}): Observable<ApiResponse<ProductRevenue[]>> {
    const httpParams = this.buildParams(period, params);
    const url = `${this.baseUrl}/by-product`;
    
    return this.http.get<ApiResponse<ProductRevenue[]>>(url, { params: httpParams })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Test API connectivity by checking if the endpoints respond
   * @returns Observable with the connection status
   */
  testApiConnectivity(): Observable<any> {
    return this.http.get(`${this.baseUrl}/summary`, { observe: 'response' })
      .pipe(
        catchError(error => {
          return of({ status: 'error', error });
        })
      );
  }

  /**
   * Build HttpParams based on the period and parameters
   * @param period The time period
   * @param params Additional parameters
   * @returns HttpParams object
   */
  private buildParams(period: TimePeriod, params: RevenueParams): HttpParams {
    let httpParams = new HttpParams().set('period', period);
    
    if (period === 'custom' && params.start_date && params.end_date) {
      httpParams = httpParams
        .set('start_date', params.start_date)
        .set('end_date', params.end_date);
    }
    
    if ((period === 'yearly' || period === 'monthly') && params.year) {
      httpParams = httpParams.set('year', params.year.toString());
    }
    
    if (period === 'monthly' && params.month) {
      httpParams = httpParams.set('month', params.month.toString());
    }
    
    return httpParams;
  }

  /**
   * Error handler for HTTP requests
   * @param error The HTTP error
   * @returns An observable with the error
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Mã lỗi: ${error.status}\nThông báo: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
  
  /**
   * Format a number as Vietnamese currency
   * @param value The number to format
   * @returns Formatted currency string
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  }
} 