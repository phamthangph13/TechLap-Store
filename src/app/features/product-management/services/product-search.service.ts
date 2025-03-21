import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SearchParams {
  query?: string;
  min_price?: number;
  max_price?: number;
  min_discount?: number;
  max_discount?: number;
  brands?: string[];
  category_ids?: string[];
  status?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}

export interface PriceRange {
  min_price: number;
  max_price: number;
}

export interface FilterOptions {
  specs: {
    cpu: string[];
    ram: string[];
    storage: string[];
    gpu: string[];
    display: string[];
    os: string[];
  };
  status: string[];
  categories: { id: string, name: string }[];
}

export interface SearchResult {
  total: number;
  page: number;
  limit: number;
  pages: number;
  products: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductSearchService {
  private baseUrl = '/api/product-search';

  constructor(private http: HttpClient) { }

  searchProducts(params: SearchParams): Observable<SearchResult> {
    let httpParams = new HttpParams();
    
    // Add all search parameters to the HTTP params
    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.min_price) httpParams = httpParams.set('min_price', params.min_price.toString());
    if (params.max_price) httpParams = httpParams.set('max_price', params.max_price.toString());
    if (params.min_discount) httpParams = httpParams.set('min_discount', params.min_discount.toString());
    if (params.max_discount) httpParams = httpParams.set('max_discount', params.max_discount.toString());
    if (params.brands && params.brands.length > 0) httpParams = httpParams.set('brands', params.brands.join(','));
    if (params.category_ids && params.category_ids.length > 0) httpParams = httpParams.set('category_ids', params.category_ids.join(','));
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.cpu) httpParams = httpParams.set('cpu', params.cpu);
    if (params.ram) httpParams = httpParams.set('ram', params.ram);
    if (params.storage) httpParams = httpParams.set('storage', params.storage);
    if (params.gpu) httpParams = httpParams.set('gpu', params.gpu);
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<SearchResult>(this.baseUrl, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  getBrands(): Observable<{brands: string[]}> {
    return this.http.get<{brands: string[]}>(`${this.baseUrl}/brands`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getPriceRange(): Observable<PriceRange> {
    return this.http.get<PriceRange>(`${this.baseUrl}/price-range`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getFilterOptions(): Observable<FilterOptions> {
    return this.http.get<FilterOptions>(`${this.baseUrl}/filter-options`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.error) {
        console.error('Error details:', error.error);
      }
    }
    return throwError(() => error);
  }
} 