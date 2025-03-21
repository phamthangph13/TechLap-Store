import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip intercepting requests that already have a full URL
  if (req.url.includes('://')) {
    return next(req);
  }

  // Assuming API URLs start with '/api'
  if (req.url.startsWith('/api')) {
    const apiUrl = environment.apiUrl || '';
    const apiReq = req.clone({
      url: `${apiUrl}${req.url}`
    });
    return next(apiReq);
  }

  return next(req);
}; 