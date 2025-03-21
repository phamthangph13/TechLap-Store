import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  // Cache các URL đã được xác thực
  private validatedUrls: Map<string, string> = new Map();
  
  constructor(private http: HttpClient) {}

  /**
   * Kiểm tra và trả về URL hình ảnh hợp lệ
   */
  validateImageUrl(fileId: string): Observable<string> {
    // Nếu đã có trong cache, trả về kết quả
    if (this.validatedUrls.has(fileId)) {
      const url = this.validatedUrls.get(fileId);
      return of(url as string);
    }

    // Endpoint đúng theo API.MD
    const url = `/api/products/files/${fileId}`;
    
    // Kiểm tra xem URL có hợp lệ không
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => {
        // Nếu thành công, cache lại URL
        this.validatedUrls.set(fileId, url);
        return url;
      }),
      catchError(error => {
        // Nếu lỗi, trả về URL placeholder
        const fallbackUrl = `https://via.placeholder.com/150x150?text=ID:${fileId.substring(0, 5)}`;
        this.validatedUrls.set(fileId, fallbackUrl);
        return of(fallbackUrl);
      }),
      shareReplay(1)
    );
  }

  /**
   * Lấy URL hình ảnh cho một fileId
   */
  getImageUrl(fileId: string): Observable<string> {
    if (!fileId) {
      return of('https://via.placeholder.com/150x150?text=No+Image');
    }
    return this.validateImageUrl(fileId);
  }
} 