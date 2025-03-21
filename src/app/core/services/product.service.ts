import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductSpecs {
  cpu: string;
  ram: string;
  storage: string;
  display: string;
  gpu: string;
  battery: string;
  os: string;
  ports: string[];
}

export interface Product {
  _id?: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  discount_percent: number;
  discount_price?: number;
  specs: ProductSpecs;
  stock_quantity: number;
  category_ids?: string[];
  thumbnail?: string;
  images?: string[];
  videos?: string[];
  created_at?: string;
  updated_at?: string;
  status?: 'available' | 'sold_out' | 'discontinued';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';
  
  constructor(private http: HttpClient) { }

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Get a specific product by ID
  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Create a new product with FormData (multipart/form-data)
  createProduct(productData: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  // Update a product with FormData (multipart/form-data)
  updateProduct(id: string, productData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productData);
  }

  // Delete a product
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get file URL for display
  getFileUrl(fileId: string): string {
    return `${this.apiUrl}/files/${fileId}`;
  }

  // Helper method to prepare form data from a product object
  prepareFormData(product: Product, files?: { 
    thumbnail?: File, 
    images?: File[], 
    videos?: File[] 
  }): FormData {
    const formData = new FormData();
    
    // Add basic product info
    formData.append('name', product.name);
    formData.append('brand', product.brand);
    formData.append('model', product.model);
    formData.append('price', product.price.toString());
    formData.append('discount_percent', product.discount_percent.toString());
    formData.append('stock_quantity', product.stock_quantity.toString());
    
    if (product.status) {
      formData.append('status', product.status);
    }

    // Add specs
    formData.append('specs.cpu', product.specs.cpu);
    formData.append('specs.ram', product.specs.ram);
    formData.append('specs.storage', product.specs.storage);
    formData.append('specs.display', product.specs.display);
    formData.append('specs.gpu', product.specs.gpu);
    formData.append('specs.battery', product.specs.battery);
    formData.append('specs.os', product.specs.os);
    
    // Add ports as multiple entries
    product.specs.ports.forEach(port => {
      formData.append('specs.ports', port);
    });
    
    // Add category IDs as multiple entries
    if (product.category_ids && product.category_ids.length > 0) {
      product.category_ids.forEach(categoryId => {
        formData.append('category_ids', categoryId);
      });
    }
    
    // Add files if provided
    if (files) {
      if (files.thumbnail) {
        formData.append('thumbnail', files.thumbnail);
      }
      
      if (files.images && files.images.length > 0) {
        files.images.forEach(image => {
          formData.append('images', image);
        });
      }
      
      if (files.videos && files.videos.length > 0) {
        files.videos.forEach(video => {
          formData.append('videos', video);
        });
      }
    }
    
    return formData;
  }
} 