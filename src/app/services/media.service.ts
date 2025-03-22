import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  // Cache for validated URLs
  private validatedUrls: Map<string, string> = new Map();
  
  constructor(private http: HttpClient) { }

  /**
   * Get file content from GridFS by file ID
   * @param fileId The ID of the file in GridFS
   * @returns Observable with blob data of the file
   */
  getFile(fileId: string): Observable<Blob> {
    if (!fileId || fileId === 'undefined' || fileId === 'null') {
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

  /**
   * Validates and returns a valid image URL
   * @param fileId The ID of the image file
   * @returns Observable with validated URL
   */
  validateImageUrl(fileId: string): Observable<string> {
    // If already in cache, return cached result
    if (this.validatedUrls.has(fileId)) {
      const url = this.validatedUrls.get(fileId);
      return of(url as string);
    }

    const url = `${environment.apiUrl}/api/products/files/${fileId}`;
    
    // Check if URL is valid
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => {
        // Cache URL if successful
        this.validatedUrls.set(fileId, url);
        return url;
      }),
      catchError(error => {
        // Log detailed error
        if (error.status === 404) {
          console.warn(`File not found in GridFS: ID=${fileId}`);
        } else {
          console.error(`Error loading file ${fileId}:`, error);
        }
        
        // Use data URI for placeholder
        const fallbackUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bMQ0AIAwAwQJ+ZuFnBt5hYeJxN3DptGa27ae7I/Y+DnCDIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZk/aCYQAWAEEFwAAAAASUVORK5CYII=';
        this.validatedUrls.set(fileId, fallbackUrl);
        return fallbackUrl;
      }),
      shareReplay(1)
    );
  }

  /**
   * Validates and returns a valid video URL
   * @param fileId The ID of the video file
   * @returns Observable with validated URL
   */
  validateVideoUrl(fileId: string): Observable<string> {
    // If already in cache, return cached result
    if (this.validatedUrls.has(`video-${fileId}`)) {
      const url = this.validatedUrls.get(`video-${fileId}`);
      return of(url as string);
    }

    const url = `${environment.apiUrl}/api/products/files/${fileId}`;
    
    // Check if URL is valid
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => {
        // Cache URL if successful
        this.validatedUrls.set(`video-${fileId}`, url);
        return url;
      }),
      catchError(error => {
        // Log detailed error
        if (error.status === 404) {
          console.warn(`File not found in GridFS: ID=${fileId}`);
        } else {
          console.error(`Error loading file ${fileId}:`, error);
        }
        
        // Use data URI for placeholder
        const fallbackUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bMQ0AIAwAwQJ+ZuFnBt5hYeJxN3DptGa27ae7I/Y+DnCDIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZk/aCYQAWAEEFwAAAAASUVORK5CYII=';
        this.validatedUrls.set(`video-${fileId}`, fallbackUrl);
        return of(fallbackUrl);
      }),
      shareReplay(1)
    );
  }

  /**
   * Gets a valid image URL for a fileId
   * @param fileId The ID of the image file
   * @returns Observable with image URL
   */
  getImageUrl(fileId: string): Observable<string> {
    if (!fileId || fileId === 'undefined' || fileId === 'null') {
      return of('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bMQ0AIAwAwQJ+ZuFnBt5hYeJxN3DptGa27ae7I/Y+DnCDIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZk/aCYQAWAEEFwAAAAASUVORK5CYII=');
    }
    return this.validateImageUrl(fileId);
  }
} 