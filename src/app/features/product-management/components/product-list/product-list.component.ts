import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { FileService } from '../../../../../app/services/file.service';
import { ProductSearchService, SearchParams, FilterOptions, PriceRange } from '../../services/product-search.service';

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
  category_ids?: string[];
  specs?: {
    cpu?: string;
    ram?: string;
    storage?: string;
    display?: string;
    gpu?: string;
    battery?: string;
    os?: string;
    ports?: string[];
  };
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, RouterLink, HttpClientModule, ReactiveFormsModule]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  apiUrl = environment.apiUrl || '';
  imageUrlMap = new Map<string, string>();
  
  // Search related properties
  searchForm: FormGroup;
  isAdvancedSearch = false;
  filterOptions: FilterOptions | null = null;
  availableBrands: string[] = [];
  priceRange: PriceRange = { min_price: 0, max_price: 100000000 };
  totalProducts = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private http: HttpClient,
    private fileService: FileService,
    private searchService: ProductSearchService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      min_price: [null],
      max_price: [null],
      min_discount: [null],
      max_discount: [null],
      brands: [[]],
      category_ids: [[]],
      status: [''],
      cpu: [''],
      ram: [''],
      storage: [''],
      gpu: [''],
      sort_by: ['price'],
      sort_order: ['asc']
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
    this.loadFilterOptions();
    this.searchProducts();
  }

  toggleAdvancedSearch(): void {
    this.isAdvancedSearch = !this.isAdvancedSearch;
  }

  loadFilterOptions(): void {
    this.searchService.getBrands().subscribe({
      next: (data) => {
        this.availableBrands = data.brands;
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      }
    });

    this.searchService.getPriceRange().subscribe({
      next: (data) => {
        this.priceRange = data;
      },
      error: (err) => {
        console.error('Error loading price range:', err);
      }
    });

    this.searchService.getFilterOptions().subscribe({
      next: (data) => {
        this.filterOptions = data;
      },
      error: (err) => {
        console.error('Error loading filter options:', err);
      }
    });
  }

  onSearch(): void {
    this.searchProducts();
  }

  clearFilters(): void {
    this.searchForm.reset({
      query: '',
      min_price: null,
      max_price: null,
      min_discount: null,
      max_discount: null,
      brands: [],
      category_ids: [],
      status: '',
      cpu: '',
      ram: '',
      storage: '',
      gpu: '',
      sort_by: 'price',
      sort_order: 'asc'
    });
    this.searchProducts();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.searchProducts();
  }

  searchProducts(): void {
    this.loading = true;
    
    const searchParams: SearchParams = {
      ...this.searchForm.value,
      page: this.currentPage,
      limit: this.pageSize
    };

    this.searchService.searchProducts(searchParams).subscribe({
      next: (result) => {
        console.log('Search results:', result);
        this.products = result.products.map(item => {
          const product: Product = {
            ...item,
            category_ids: Array.isArray(item.category_ids) ? item.category_ids :
                        item.category_id ? [item.category_id] :
                        item.categories ? item.categories :
                        []
          };
          return product;
        });
        this.totalProducts = result.total;
        this.totalPages = result.pages;
        this.loading = false;
        this.preloadImages();
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.';
        console.error('Lỗi khi tải sản phẩm:', err);
        this.loading = false;
        // Fallback to regular product fetch if search endpoint fails
        this.fetchProducts();
      }
    });
  }

  fetchProducts(): void {
    this.loading = true;
    this.http.get<any[]>('/api/products')
      .subscribe({
        next: (data) => {
          console.log('Dữ liệu sản phẩm từ API:', data);
          
          // Xử lý dữ liệu trả về để đảm bảo category_ids đúng định dạng
          this.products = data.map(item => {
            // Tạo đối tượng Product từ dữ liệu API
            const product: Product = {
              ...item,
              // Đảm bảo category_ids luôn là mảng, kiểm tra các khả năng khác nhau
              category_ids: Array.isArray(item.category_ids) ? item.category_ids :
                            item.category_id ? [item.category_id] :
                            item.categories ? item.categories :
                            []
            };
            
            console.log('Sản phẩm sau xử lý:', product.name, 'với category_ids:', product.category_ids);
            return product;
          });
          
          this.loading = false;
          this.preloadImages();
        },
        error: (err) => {
          this.error = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.';
          console.error('Lỗi khi tải sản phẩm:', err);
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
        console.log('Danh mục từ API:', data);
        this.categories = data;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh mục:', err);
        // Nếu không thể kết nối đến API, vẫn dùng ID thực tế
        this.categories = [
          { _id: '67dda5f32938c7d62376cac2', name: 'Laptop Văn phòng' },
          { _id: '67ddc833f56fae9451fdc8cb', name: 'Laptop Gaming' }
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
    if (!categoryId) return 'N/A';
    
    // Tìm danh mục trong danh sách categories
    const category = this.categories.find(c => c._id === categoryId);
    
    // Nếu tìm thấy thì trả về tên danh mục
    if (category) {
      return category.name;
    }
    
    // Nếu không tìm thấy thì hiển thị một phần ID để dễ debug
    const shortId = categoryId.length > 8 ? categoryId.substring(0, 8) + '...' : categoryId;
    return `[${shortId}]`;
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