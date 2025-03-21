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
        // Log chi tiết lỗi
        if (error.status === 404) {
          console.warn(`File not found in GridFS: ID=${fileId}`);
        } else {
          console.error(`Error loading file ${fileId}:`, error);
        }
        
        // Sử dụng data URI cho placeholder
        const fallbackUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bMQ0AIAwAwQJ+ZuFnBt5hYeJxN3DptGa27ae7I/Y+DnCDIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZk/aCYQAWAEEFwAAAAASUVORK5CYII=';
        this.validatedUrls.set(fileId, fallbackUrl);
        return of(fallbackUrl);
      }),
      shareReplay(1)
    );
  }

  /**
   * Kiểm tra và trả về URL video hợp lệ
   */
  validateVideoUrl(fileId: string): Observable<string> {
    // Nếu đã có trong cache, trả về kết quả
    if (this.validatedUrls.has(`video-${fileId}`)) {
      const url = this.validatedUrls.get(`video-${fileId}`);
      return of(url as string);
    }

    // Endpoint đúng theo API.MD
    const url = `/api/products/files/${fileId}`;
    
    // Kiểm tra xem URL có hợp lệ không
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => {
        // Nếu thành công, cache lại URL
        this.validatedUrls.set(`video-${fileId}`, url);
        return url;
      }),
      catchError(error => {
        // Log chi tiết lỗi
        if (error.status === 404) {
          console.warn(`File not found in GridFS: ID=${fileId}`);
        } else {
          console.error(`Error loading file ${fileId}:`, error);
        }
        
        // Sử dụng data URI cho placeholder 
        const fallbackUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bMQ0AIAwAwQJ+ZuFnBt5hYeJxN3DptGa27ae7I/Y+DnCDIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZk/aCYQAWAEEFwAAAAASUVORK5CYII=';
        this.validatedUrls.set(`video-${fileId}`, fallbackUrl);
        return of(fallbackUrl);
      }),
      shareReplay(1)
    );
  }

  /**
   * Lấy URL hình ảnh cho một fileId
   */
  getImageUrl(fileId: string): Observable<string> {
    if (!fileId || fileId === 'undefined' || fileId === 'null') {
      return of('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bMQ0AIAwAwQJ+ZuFnBt5hYeJxN3DptGa27ae7I/Y+DnCDIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZk/aCYQAWAEEFwAAAAASUVORK5CYII=');
    }
    return this.validateImageUrl(fileId);
  }
}