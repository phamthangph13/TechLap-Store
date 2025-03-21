import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { FileService } from '../../../../../app/services/file.service';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  discount_percent: number;
  discount_price: number;
  stock_quantity: number;
  status: string;
  created_at: string;
  thumbnail?: string;
  category_id?: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink, HttpClientModule]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  apiUrl = environment.apiUrl || '';
  imageUrlMap = new Map<string, string>();

  constructor(
    private http: HttpClient,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.loading = true;
    this.http.get<Product[]>('/api/products')
      .subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
          
          // Tải trước và kiểm tra các URL hình ảnh
          this.preloadImages();
        },
        error: (err) => {
          this.error = 'Failed to load products. Please try again.';
          console.error('Error fetching products:', err);
          // If you're testing with a mock server that isn't set up yet,
          // you can display mock data for development purposes
          if (err.status === 404 || err.status === 400) {
            this.products = this.getMockProducts();
            this.error = 'Using mock data (API not available)';
          }
          this.loading = false;
        }
      });
  }

  // Phương thức tải trước và kiểm tra URL hình ảnh
  private preloadImages(): void {
    this.products.forEach(product => {
      if (product.thumbnail) {
        this.fileService.validateImageUrl(product.thumbnail).subscribe(url => {
          this.imageUrlMap.set(product.thumbnail!, url);
        });
      }
    });
  }

  fetchCategories(): void {
    this.http.get<Category[]>('/api/categories').subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        // Mock categories for development
        this.categories = [
          { _id: 'laptop', name: 'Laptops' },
          { _id: 'desktop', name: 'Desktops' },
          { _id: 'tablet', name: 'Tablets' },
          { _id: 'mobile', name: 'Mobile Phones' },
          { _id: 'accessories', name: 'Accessories' }
        ];
      }
    });
  }

  // Helper methods for template
  getImageUrl(imageId: string): string {
    if (!imageId) return 'assets/images/no-image.png';
    
    // Sử dụng URL từ cache nếu có
    if (this.imageUrlMap.has(imageId)) {
      return this.imageUrlMap.get(imageId)!;
    }
    
    // Nếu không có trong cache, sử dụng URL endpoint trực tiếp (thay vì Observable)
    return `/api/products/files/${imageId}`;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c._id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getSavedAmount(product: Product): number {
    if (!product.price || !product.discount_percent) return 0;
    return product.price - product.discount_price;
  }

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }

  // Mock data for development purposes when API is not available
  private getMockProducts(): Product[] {
    return [
      {
        _id: '1',
        name: 'Laptop Dell XPS 15',
        brand: 'Dell',
        model: 'XPS 15 9530',
        price: 35000000,
        discount_percent: 10,
        discount_price: 31500000,
        stock_quantity: 50,
        status: 'available',
        created_at: new Date().toISOString(),
        thumbnail: '', // 'https://placehold.co/200x200?text=Dell+XPS',
        category_id: 'laptop'
      },
      {
        _id: '2',
        name: 'Laptop MacBook Pro 16',
        brand: 'Apple',
        model: 'MacBook Pro 16 M3',
        price: 45000000,
        discount_percent: 5,
        discount_price: 42750000,
        stock_quantity: 20,
        status: 'available',
        created_at: new Date().toISOString(),
        thumbnail: '', // 'https://placehold.co/200x200?text=MacBook+Pro',
        category_id: 'laptop'
      }
    ];
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete(`/api/products/${id}`)
        .subscribe({
          next: () => {
            this.products = this.products.filter(product => product._id !== id);
          },
          error: (err) => {
            console.error('Error deleting product:', err);
            
            // For development without a backend
            if (err.status === 404 || err.status === 400) {
              // Simulate successful deletion for development
              this.products = this.products.filter(product => product._id !== id);
              console.log('Mock deletion successful');
            } else {
              alert('Failed to delete product. Please try again.');
            }
          }
        });
    }
  }
} 