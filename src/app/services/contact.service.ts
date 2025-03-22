import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'read' | 'unread';
  message_id: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ContactResponse {
  success: boolean;
  data: Contact[];
  pagination: Pagination;
}

export interface ContactDetailResponse {
  success: boolean;
  data: Contact;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = '/api/contact';

  constructor(private http: HttpClient) {}

  /**
   * Get all contacts with pagination
   */
  getContacts(page: number = 1, limit: number = 10): Observable<ContactResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ContactResponse>(this.apiUrl, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Get a single contact by id
   */
  getContact(id: string): Observable<ContactDetailResponse> {
    return this.http.get<ContactDetailResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Mark a contact as read
   */
  markAsRead(id: string): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(`${this.apiUrl}/${id}/read`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete a contact
   */
  deleteContact(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Error handler for HTTP requests
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
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 