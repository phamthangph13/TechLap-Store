import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = environment.apiUrl || '';
  private fileCache = new Map<string, string>();
  
  constructor(private http: HttpClient) {}
  
  /**
   * Lấy URL hình ảnh với khả năng fallback
   * @param fileId ID của file trong MongoDB
   * @returns URL hình ảnh hoặc URL placeholder nếu không tìm thấy
   */
  getImageUrl(fileId: string | null | undefined): string {
    if (!fileId) {
      return 'assets/images/no-image.png';
    }
    
    // Kiểm tra cache
    if (this.fileCache.has(fileId)) {
      return this.fileCache.get(fileId) as string;
    }
    
    // Trả về URL API
    return `/api/files/${fileId}`;
  }
  
  /**
   * Kiểm tra tình trạng của file
   * @param fileId ID của file trong MongoDB
   * @returns Observable chứa URL thực tế hoặc URL dự phòng
   */
  validateImageUrl(fileId: string): Observable<string> {
    const url = `/api/files/${fileId}`;
    
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => {
        // Nếu thành công, lưu vào cache và trả về URL
        this.fileCache.set(fileId, url);
        return url;
      }),
      catchError(error => {
        // Nếu lỗi, tạo URL placeholder
        const fallbackUrl = `https://placehold.co/200x200?text=ID:${fileId.substring(0, 5)}`;
        this.fileCache.set(fileId, fallbackUrl);
        return of(fallbackUrl);
      })
    );
  }
  
  /**
   * Xóa cache
   */
  clearCache(): void {
    this.fileCache.clear();
  }
} 