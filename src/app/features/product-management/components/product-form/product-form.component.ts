import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FileService } from '../../../../../app/services/file.service';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

// Custom validator để kiểm tra nếu có ít nhất một port hợp lệ
function atLeastOnePortRequired(control: AbstractControl): ValidationErrors | null {
  const ports = control.value as string[];
  const validPorts = ports.filter(port => port && port.trim().length > 0);
  return validPorts.length > 0 ? null : { noValidPorts: true };
}

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Product {
  _id?: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  discount_percent: number;
  discount_price: number;
  stock_quantity: number;
  status: string;
  created_at?: string;
  category_ids?: string[] | string;
  thumbnail?: string | null;
  images?: string[];
  videos?: string[];
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    display: string;
    gpu: string;
    battery: string;
    os: string;
    ports: string[];
  };
}

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, RouterLink, HttpClientModule]
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  productId = '';
  loading = false;
  submitting = false;
  thumbnailPreview: string | null = null;
  imagePreviewUrls: string[] = [];
  videoPreviewUrls: string[] = [];
  errorMessage = '';
  autoCalculatedDiscount = 0;

  // Tệp và xem trước
  thumbnailFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      model: ['', [Validators.required]],
      price: [1000000, [Validators.required, Validators.min(1000)]],
      discount_percent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      discount_price: [{ value: 0, disabled: true }],
      specs: this.fb.group({
        cpu: ['', Validators.required],
        ram: ['', Validators.required],
        storage: ['', Validators.required],
        display: ['', Validators.required],
        gpu: ['', Validators.required],
        battery: ['', Validators.required],
        os: ['', Validators.required],
        ports: this.fb.array([this.fb.control('')], [atLeastOnePortRequired])
      }),
      stock_quantity: [10, [Validators.required, Validators.min(1)]],
      category_ids: [''],
      status: ['available'],
      thumbnail: [null],
      images: [[]],
      videos: [[]]
    });

    // Subscribe to price and discount changes to calculate discount price
    this.productForm.get('price')?.valueChanges.subscribe(price => {
      this.calculateDiscountPrice();
    });

    this.productForm.get('discount_percent')?.valueChanges.subscribe(percent => {
      this.calculateDiscountPrice();
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
    this.checkIfEditMode();
  }

  // Calculate the discounted price
  calculateDiscountPrice(): void {
    const price = this.productForm.get('price')?.value || 0;
    const discountPercent = this.productForm.get('discount_percent')?.value || 0;
    
    if (price && discountPercent) {
      const discountAmount = (price * discountPercent) / 100;
      this.autoCalculatedDiscount = Math.round(price - discountAmount);
      this.productForm.get('discount_price')?.setValue(this.autoCalculatedDiscount);
    } else {
      this.autoCalculatedDiscount = price;
      this.productForm.get('discount_price')?.setValue(price);
    }
  }

  // Format price in VND
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }

  // Get calculated saved amount
  getSavedAmount(): number {
    const price = this.productForm.get('price')?.value || 0;
    const discountPrice = this.autoCalculatedDiscount || price;
    return price - discountPrice;
  }

  // Helper methods for form arrays
  get portsArray(): FormArray {
    return this.productForm.get('specs')?.get('ports') as FormArray;
  }
  
  // Kiểm tra xem cổng kết nối có hợp lệ hay không
  get portsInvalid(): boolean {
    if (!this.portsArray || this.portsArray.length === 0) return true;
    
    // Kiểm tra xem tất cả các port đều trống
    return this.portsArray.controls.every(control => {
      return !control.value || control.value.trim() === '';
    });
  }

  addPort(): void {
    this.portsArray.push(this.fb.control(''));
  }

  removePort(index: number): void {
    if (this.portsArray.length > 1) {
      this.portsArray.removeAt(index);
    }
  }

  fetchCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (err: any) => {
        console.error('Lỗi khi tải danh mục:', err);
        // Sử dụng dữ liệu mẫu nếu không thể tải danh mục
        this.categories = this.getMockCategories();
      }
    });
  }

  checkIfEditMode(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.productId = id;
        this.fetchProductDetails(id);
      }
    });
  }

  fetchProductDetails(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product: Product) => {
        this.patchFormValues(product);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching product details:', err);
        this.errorMessage = `Không thể tải thông tin sản phẩm: ${err.message}`;
        this.loading = false;
      }
    });
  }

  patchFormValues(product: Product): void {
    // Reset the ports array with existing values
    const portsArray = this.fb.array(
      product.specs.ports.map((port: string) => this.fb.control(port))
    );

    // Replace the current empty FormArray with the new one
    (this.productForm.get('specs') as FormGroup).setControl('ports', portsArray);

    // Determine category ID to display
    let categoryId = '';
    if (product.category_ids) {
      if (Array.isArray(product.category_ids) && product.category_ids.length > 0) {
        categoryId = product.category_ids[0];
      } else if (typeof product.category_ids === 'string') {
        categoryId = product.category_ids;
      }
    }

    // Patch other form values
    this.productForm.patchValue({
      name: product.name,
      brand: product.brand,
      model: product.model,
      price: product.price,
      discount_percent: product.discount_percent,
      specs: {
        cpu: product.specs.cpu,
        ram: product.specs.ram,
        storage: product.specs.storage,
        display: product.specs.display,
        gpu: product.specs.gpu,
        battery: product.specs.battery,
        os: product.specs.os
      },
      stock_quantity: product.stock_quantity,
      category_ids: categoryId,
      status: product.status || 'available'
    });

    // Manually set discount price (since it's disabled in the form)
    this.autoCalculatedDiscount = product.discount_price;
    this.productForm.get('discount_price')?.setValue(product.discount_price);

    // Set media previews if available
    if (product.thumbnail) {
      this.thumbnailPreview = `/api/products/files/${product.thumbnail}`;
    }
    
    if (product.images && product.images.length) {
      this.imagePreviewUrls = [];
      product.images.forEach((imageId: string) => {
        this.imagePreviewUrls.push(`/api/products/files/${imageId}`);
      });
    }
    
    if (product.videos && product.videos.length) {
      this.videoPreviewUrls = [];
      product.videos.forEach((videoId: string) => {
        this.videoPreviewUrls.push(`/api/products/files/${videoId}`);
      });
    }
  }

  onThumbnailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.productForm.patchValue({ thumbnail: file });
      this.thumbnailFile = file;
      
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.thumbnailPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const files = Array.from(input.files);
      this.productForm.patchValue({ images: files });
      
      // Preview images
      this.imagePreviewUrls = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrls.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onVideosChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const files = Array.from(input.files);
      this.productForm.patchValue({ videos: files });
      
      // Preview videos (just set URLs for displaying in UI)
      this.videoPreviewUrls = files.map(file => URL.createObjectURL(file));
    }
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.markAllAsTouched();

    // Check if form is valid
    if (this.productForm.invalid || this.portsInvalid) {
      return;
    }

    this.submitting = true;
    
    // Prepare form data
    const formData = new FormData();
    const productData = this.collectFormData();
    
    // Add product data as individual form fields
    formData.append('name', productData.name);
    formData.append('brand', productData.brand);
    formData.append('model', productData.model);
    formData.append('price', productData.price.toString());
    formData.append('discount_percent', productData.discount_percent.toString());
    // Don't send discount_price as it's calculated server-side
    formData.append('stock_quantity', productData.stock_quantity.toString());
    formData.append('status', productData.status);
    
    // Add specs fields
    formData.append('specs.cpu', productData.specs.cpu);
    formData.append('specs.ram', productData.specs.ram);
    formData.append('specs.storage', productData.specs.storage);
    formData.append('specs.display', productData.specs.display);
    formData.append('specs.gpu', productData.specs.gpu);
    formData.append('specs.battery', productData.specs.battery);
    formData.append('specs.os', productData.specs.os);
    
    // Add ports as separate entries
    productData.specs.ports.forEach((port: string) => {
      formData.append('specs.ports', port);
    });
    
    // Add category_ids as separate entries
    if (productData.category_ids) {
      // Convert to array format
      let categoryArray: string[] = [];
      
      if (typeof productData.category_ids === 'string' && productData.category_ids.trim() !== '') {
        // Single category ID
        categoryArray = [productData.category_ids.trim()];
      } else if (Array.isArray(productData.category_ids)) {
        // Filter out any empty values
        categoryArray = productData.category_ids
          .filter((id: string) => typeof id === 'string' && id.trim() !== '')
          .map((id: string) => id.trim());
      }
      
      // Only proceed if we have valid categories
      if (categoryArray.length > 0) {
        console.log('Using category_ids:', categoryArray);
        
        // Append each category ID separately to the FormData
        categoryArray.forEach(categoryId => {
          formData.append('category_ids[]', categoryId);
        });
      }
    }
    
    // Add media files to form data
    if (this.thumbnailFile) {
      formData.append('thumbnail', this.thumbnailFile);
    }
    
    // Add image files if any
    const imageInput = document.querySelector('#images') as HTMLInputElement;
    if (imageInput && imageInput.files && imageInput.files.length > 0) {
      for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images', imageInput.files[i]);
      }
    }
    
    // Add video files if any
    const videoInput = document.querySelector('#videos') as HTMLInputElement;
    if (videoInput && videoInput.files && videoInput.files.length > 0) {
      for (let i = 0; i < videoInput.files.length; i++) {
        formData.append('videos', videoInput.files[i]);
      }
    }
    
    // Send data to API
    if (this.isEditMode) {
      this.updateProduct(formData);
    } else {
      this.createProduct(formData);
    }
  }

  handleSubmitResponse(response: any): void {
    // Redirect back to product list page
    this.router.navigateByUrl('/admin/product-management');
  }
  
  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else if (control) {
        control.markAsTouched();
      }
    });
  }

  markAllAsTouched(): void {
    this.markFormGroupTouched(this.productForm);
  }

  // Dữ liệu mẫu cho danh mục
  getMockCategories(): Category[] {
    return [
      { _id: '1', name: 'Laptop Văn phòng', description: 'Laptop phục vụ nhu cầu văn phòng, học tập cơ bản' },
      { _id: '2', name: 'Laptop Gaming', description: 'Laptop chuyên dụng cho chơi game' },
      { _id: '3', name: 'Laptop Đồ họa', description: 'Laptop cho các công việc đồ họa, thiết kế' },
      { _id: '4', name: 'PC Desktop', description: 'Máy tính để bàn' },
      { _id: '5', name: 'Linh kiện', description: 'Các linh kiện máy tính' }
    ];
  }

  // Phương thức thu thập dữ liệu từ form
  collectFormData(): any {
    const formValue = this.productForm.getRawValue();
    
    // Lọc các cổng kết nối không trống
    const ports = this.portsArray.controls
      .map(control => control.value)
      .filter(port => port && port.trim() !== '');
    
    // Chuẩn bị dữ liệu sản phẩm
    return {
      ...formValue,
      discount_price: this.autoCalculatedDiscount,
      specs: {
        ...formValue.specs,
        ports
      }
    };
  }
  
  // Phương thức cập nhật sản phẩm
  updateProduct(formData: FormData): void {
    this.productService.updateProduct(this.productId, formData).subscribe({
      next: (response: any) => {
        this.submitting = false;
        this.router.navigate(['/admin/product-management']);
      },
      error: (err: any) => {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
        this.submitting = false;
        this.errorMessage = 'Không thể cập nhật sản phẩm. Vui lòng thử lại.';
      }
    });
  }
  
  // Phương thức tạo sản phẩm mới
  createProduct(formData: FormData): void {
    console.log('Form data entries:');
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    
    console.log('Raw form data:', this.productForm.getRawValue());

    this.productService.createProduct(formData).subscribe({
      next: (response: any) => {
        this.submitting = false;
        this.router.navigate(['/admin/product-management']);
      },
      error: (err: any) => {
        console.error('Lỗi khi tạo sản phẩm:', err);
        if (err.error && err.error.errors) {
          console.log('Validation errors:', JSON.stringify(err.error.errors, null, 2));
          // Set error message to show validation problems
          let validationErrors = '';
          for (const key in err.error.errors) {
            if (Object.prototype.hasOwnProperty.call(err.error.errors, key)) {
              validationErrors += `${key}: ${err.error.errors[key]}\n`;
            }
          }
          this.errorMessage = `Validation errors: ${validationErrors}`;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Không thể tạo sản phẩm. Vui lòng thử lại.';
        }
        this.submitting = false;
      }
    });
  }
} 