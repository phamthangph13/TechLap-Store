import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createProduct(productData: FormData): Observable<any> {
    console.log('Creating product with formData:', [...productData.entries()]);
    return this.http.post<any>(this.apiUrl, productData)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateProduct(id: string, productData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, productData)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
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