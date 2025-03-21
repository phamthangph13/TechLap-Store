import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  _id?: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = '/api/categories';
  
  constructor(private http: HttpClient) { }

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // Get a specific category by ID
  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // Create a new category
  createCategory(category: Category): Observable<Category> {
    const params = new HttpParams()
      .set('name', category.name)
      .set('description', category.description || '');
    
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };
    
    return this.http.post<Category>(this.apiUrl, params.toString(), options);
  }

  // Update a category
  updateCategory(id: string, category: Category): Observable<Category> {
    console.log('Updating category:', id, JSON.stringify(category));
    
    const params = new HttpParams()
      .set('name', category.name)
      .set('description', category.description || '');
    
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };
    
    return this.http.put<Category>(`${this.apiUrl}/${id}`, params.toString(), options);
  }

  // Delete a category
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
