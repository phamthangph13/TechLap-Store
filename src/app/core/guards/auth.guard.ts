import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Tạm thời bypass xác thực để kiểm tra lỗi
  return true;
  
  /* 
  // Mở comment phần này khi cần kích hoạt lại xác thực
  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to the login page
  return router.parseUrl('/login');
  */
}; 