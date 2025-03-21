import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = '/api/categories';

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching categories', error);
        return of(this.getMockCategories());
      })
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: string, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Cung cấp dữ liệu mẫu khi API không khả dụng
  private getMockCategories(): Category[] {
    return [
      { _id: '1', name: 'Laptop Văn phòng', description: 'Laptop phục vụ nhu cầu văn phòng, học tập cơ bản' },
      { _id: '2', name: 'Laptop Gaming', description: 'Laptop chuyên dụng cho chơi game' },
      { _id: '3', name: 'Laptop Đồ họa', description: 'Laptop cho các công việc đồ họa, thiết kế' },
      { _id: '4', name: 'PC Desktop', description: 'Máy tính để bàn' },
      { _id: '5', name: 'Linh kiện', description: 'Các linh kiện máy tính' }
    ];
  }
} 