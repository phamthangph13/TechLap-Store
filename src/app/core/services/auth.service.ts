import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface User {
  id: number;
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in from local storage
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    if (storedToken) {
      try {
        // In a real app, you might decode the JWT to get user details
        // For now we'll just create a minimal user object
        const user: User = {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          token: storedToken
        };
        this.currentUserSubject.next(user);
      } catch (error) {
        // Invalid token, clear storage
        localStorage.removeItem(this.TOKEN_KEY);
      }
    }
  }

  login(username: string, password: string): Observable<User> {
    // In a real app, this would be an API call
    // For demo purposes, we'll simulate a successful login with admin/admin
    if (username === 'admin' && password === 'admin') {
      const user: User = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        token: 'fake-jwt-token'
      };
      
      // Store token
      localStorage.setItem(this.TOKEN_KEY, user.token);
      this.currentUserSubject.next(user);
      return of(user);
    }
    
    // Login failed
    throw new Error('Invalid username or password');
  }

  logout(navigateToLogin: boolean = false): void {
    // Remove the token from local storage
    localStorage.removeItem(this.TOKEN_KEY);
    
    // Clear the current user
    this.currentUserSubject.next(null);
    
    // Navigate to login page only if explicitly requested
    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.token || null;
  }
}
