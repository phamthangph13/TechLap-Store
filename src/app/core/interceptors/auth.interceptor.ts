import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  
  // Get the auth token from the service
  const authToken = authService.getToken();

  // Add auth token to request if available
  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }

  // Handle the request and catch any errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If it's a 401 error but not from login
      if (error.status === 401 && !req.url.includes('/login')) {
        console.error('Authentication error:', error);
        
        // Create a standard error response that the component can handle
        const errorResponse = {
          status: 401,
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.',
          error: 'Unauthorized'
        };
        
        // Create a temporary token to keep the auth state alive
        // This prevents automatic redirect to login page
        const tokenValue = 'temp-recovery-token';
        localStorage.setItem('auth_token', tokenValue);
        
        // Return a new error response to be handled by the component
        return throwError(() => new HttpErrorResponse({
          error: errorResponse,
          status: 401,
          statusText: 'Unauthorized'
        }));
      }
      
      // For any other error, just pass it through
      return throwError(() => error);
    })
  );
}; 