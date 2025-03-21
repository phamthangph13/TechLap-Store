import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  constructor(private http: HttpClient) { }

  /**
   * Get file content from GridFS by file ID
   * @param fileId The ID of the file in GridFS
   * @returns Observable with blob data of the file
   */
  getFile(fileId: string): Observable<Blob> {
    if (!fileId) {
      return of(new Blob());
    }
    
    const url = `${environment.apiUrl}/api/products/files/${fileId}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error loading media file:', error);
        return of(new Blob());
      })
    );
  }

  /**
   * Creates an object URL from a Blob
   * @param blob The blob data
   * @returns Safe URL to use in img/video src
   */
  createObjectUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Revokes an object URL to free memory
   * @param url The object URL to revoke
   */
  revokeObjectUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
} 