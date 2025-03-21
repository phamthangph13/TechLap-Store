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

interface ProductInfo {
  title: string;
  content: string;
}

interface VariantSpec {
  name: string;
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
  price: number;
  discount_percent: number;
}

interface Color {
  name: string;
  code: string;
  price_adjustment: number;
  discount_adjustment: number;
  images: string[];
}

interface Product {
  _id?: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  discount_percent: number;
  discount_price: number;
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
  variant_specs?: VariantSpec[];
  colors?: Color[];
  stock_quantity: number;
  status: string;
  created_at?: string;
  category_ids?: string[];
  thumbnail?: string | null;
  images?: string[];
  videos?: string[];
  product_info?: ProductInfo[];
  highlights?: string[];
  short_description?: string;
}

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, RouterLink, HttpClientModule]
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  productId = '';
  loading = false;
  submitting = false;
  thumbnailPreview: string = '';
  imagePreviewUrls: string[] = [];
  videoPreviewUrls: string[] = [];
  errorMessage = '';
  autoCalculatedDiscount = 0;

  // Files for upload
  thumbnailFile: File | null = null;
  imageFiles: File[] = [];
  videoFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService,
    public productService: ProductService,
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
      variant_specs: this.fb.array([]),
      colors: this.fb.array([]),
      stock_quantity: [10, [Validators.required, Validators.min(1)]],
      category_ids: this.fb.array([]),
      status: ['available'],
      thumbnail: [null],
      images: [[]],
      videos: [[]],
      product_info: this.fb.array([]),
      highlights: this.fb.array([]),
      short_description: ['']
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
    
    // Initialize at least one entry for the various data arrays
    if (this.productInfoArray.length === 0) {
      this.addProductInfo();
    }
    
    if (this.highlightsArray.length === 0) {
      this.addHighlight();
    }
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
  
  get categoryIdsArray(): FormArray {
    return this.productForm.get('category_ids') as FormArray;
  }

  get variantSpecsArray(): FormArray {
    return this.productForm.get('variant_specs') as FormArray;
  }

  get colorsArray(): FormArray {
    return this.productForm.get('colors') as FormArray;
  }

  get productInfoArray(): FormArray {
    return this.productForm.get('product_info') as FormArray;
  }

  get highlightsArray(): FormArray {
    return this.productForm.get('highlights') as FormArray;
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

  onCategoryChange(event: any, categoryId: string): void {
    const checked = event.target.checked;
    const categoryIdsArray = this.categoryIdsArray;
    
    if (checked) {
      // Add category ID to the array
      categoryIdsArray.push(this.fb.control(categoryId));
    } else {
      // Remove category ID from the array
      const index = categoryIdsArray.controls.findIndex(control => control.value === categoryId);
      if (index >= 0) {
        categoryIdsArray.removeAt(index);
      }
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.categoryIdsArray.controls.some(control => control.value === categoryId);
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

    // Clear existing form arrays
    while (this.categoryIdsArray.length) {
      this.categoryIdsArray.removeAt(0);
    }
    while (this.variantSpecsArray.length) {
      this.variantSpecsArray.removeAt(0);
    }
    while (this.colorsArray.length) {
      this.colorsArray.removeAt(0);
    }
    while (this.productInfoArray.length) {
      this.productInfoArray.removeAt(0);
    }
    while (this.highlightsArray.length) {
      this.highlightsArray.removeAt(0);
    }

    // Add category IDs
    if (product.category_ids && product.category_ids.length > 0) {
      product.category_ids.forEach(categoryId => {
        this.categoryIdsArray.push(this.fb.control(categoryId));
      });
    }

    // Add variant specs
    if (product.variant_specs && product.variant_specs.length > 0) {
      product.variant_specs.forEach(variant => {
        const variantSpecsPortsArray = this.fb.array(
          variant.specs.ports.map(port => this.fb.control(port))
        );
        
        const variantSpecGroup = this.fb.group({
          name: [variant.name, Validators.required],
          specs: this.fb.group({
            cpu: [variant.specs.cpu, Validators.required],
            ram: [variant.specs.ram, Validators.required],
            storage: [variant.specs.storage, Validators.required],
            display: [variant.specs.display, Validators.required],
            gpu: [variant.specs.gpu, Validators.required],
            battery: [variant.specs.battery, Validators.required],
            os: [variant.specs.os, Validators.required],
            ports: variantSpecsPortsArray
          }),
          price: [variant.price, [Validators.required, Validators.min(1000)]],
          discount_percent: [variant.discount_percent, [Validators.required, Validators.min(0), Validators.max(100)]]
        });
        
        this.variantSpecsArray.push(variantSpecGroup);
      });
    }

    // Add colors
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach(color => {
        const colorGroup = this.fb.group({
          name: [color.name, Validators.required],
          code: [color.code, Validators.required],
          price_adjustment: [color.price_adjustment],
          discount_adjustment: [color.discount_adjustment],
          images: [color.images || []]
        });
        
        this.colorsArray.push(colorGroup);
      });
    }

    // Add product info
    if (product.product_info && product.product_info.length > 0) {
      product.product_info.forEach(info => {
        const infoGroup = this.fb.group({
          title: [info.title, Validators.required],
          content: [info.content, Validators.required]
        });
        
        this.productInfoArray.push(infoGroup);
      });
    }

    // Add highlights
    if (product.highlights && product.highlights.length > 0) {
      product.highlights.forEach(highlight => {
        this.highlightsArray.push(this.fb.control(highlight, Validators.required));
      });
    }

    // Set the rest of the form values
    this.productForm.patchValue({
      name: product.name,
      brand: product.brand,
      model: product.model,
      price: product.price,
      discount_percent: product.discount_percent,
      discount_price: product.discount_price,
      stock_quantity: product.stock_quantity,
      status: product.status,
      thumbnail: product.thumbnail,
      images: product.images || [],
      videos: product.videos || [],
      short_description: product.short_description || '',
      specs: {
        cpu: product.specs.cpu,
        ram: product.specs.ram,
        storage: product.specs.storage,
        display: product.specs.display,
        gpu: product.specs.gpu,
        battery: product.specs.battery,
        os: product.specs.os
      }
    });

    this.calculateDiscountPrice();

    // Load thumbnail preview if available
    if (product.thumbnail) {
      this.thumbnailPreview = this.productService.getProductFileUrl(product.thumbnail);
    }

    // Load image previews if available
    if (product.images && product.images.length > 0) {
      this.imagePreviewUrls = product.images.map(imageId => this.productService.getProductFileUrl(imageId));
    }

    // Load video previews if available
    if (product.videos && product.videos.length > 0) {
      this.videoPreviewUrls = product.videos.map(videoId => this.productService.getProductFileUrl(videoId));
    }
  }

  onThumbnailChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.thumbnailFile = files[0];
      
      // Create thumbnail preview
      if (this.thumbnailFile) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.thumbnailPreview = e.target.result as string;
        };
        reader.readAsDataURL(this.thumbnailFile);
      }
    }
  }

  onImagesChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.imageFiles = Array.from(files);
      
      // Create image previews
      this.imagePreviewUrls = [];
      for (const file of this.imageFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onVideosChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.videoFiles = Array.from(files);
      
      // Create video previews if needed
      this.videoPreviewUrls = [];
      for (const file of this.videoFiles) {
        // You can either create video preview thumbnails or just store the file names
        this.videoPreviewUrls.push(file.name);
      }
    }
  }

  onSubmit(): void {
    // Check if the form is valid
    if (!this.productForm.valid) {
      // Mark all form controls as touched to trigger validation errors
      this.markAllAsTouched();
      return;
    }

    this.submitting = true;

    // Collect the form data
    const formData = this.collectFormData();

    // Use the appropriate method based on isEditMode
    if (this.isEditMode) {
      this.updateProduct(formData);
    } else {
      this.createProduct(formData);
    }
  }

  handleSubmitResponse(response: any): void {
    console.log('Form submission successful:', response);
    
    // Redirect back to the product list
    this.router.navigate(['/admin/product-management']);
    
    // You could also show a success message if you have a notification system
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
  collectFormData(): FormData {
    const formData = new FormData();
    const formValue = this.productForm.value;

    // Append basic product information
    formData.append('name', formValue.name);
    formData.append('brand', formValue.brand);
    formData.append('model', formValue.model);
    formData.append('price', formValue.price.toString());
    formData.append('discount_percent', formValue.discount_percent?.toString() || '0');
    formData.append('stock_quantity', formValue.stock_quantity.toString());
    formData.append('short_description', formValue.short_description || '');

    // Append product specs
    const specsValue = formValue.specs || {};
    formData.append('specs.cpu', specsValue.cpu || '');
    formData.append('specs.ram', specsValue.ram || '');
    formData.append('specs.storage', specsValue.storage || '');
    formData.append('specs.display', specsValue.display || '');
    formData.append('specs.gpu', specsValue.gpu || '');
    formData.append('specs.battery', specsValue.battery || '');
    formData.append('specs.os', specsValue.os || '');

    // Append ports
    if (specsValue.ports && specsValue.ports.length > 0) {
      specsValue.ports.forEach((port: string) => {
        if (port && port.trim()) {
          formData.append('specs.ports', port.trim());
        }
      });
    }

    // Append category IDs
    if (formValue.category_ids && formValue.category_ids.length > 0) {
      formValue.category_ids.forEach((categoryId: string) => {
        formData.append('category_ids', categoryId);
      });
    }

    // Append highlights
    const highlightsControl = this.productForm.get('highlights') as FormArray;
    if (highlightsControl && highlightsControl.length > 0) {
      const highlights = highlightsControl.controls.map(control => control.value);
      formData.append('highlights', JSON.stringify(highlights));
    }

    // Append product_info
    const productInfoArray = this.productForm.get('product_info') as FormArray;
    if (productInfoArray && productInfoArray.length > 0) {
      const productInfo = productInfoArray.controls.map(control => {
        return {
          title: control.get('title')?.value,
          content: control.get('content')?.value
        };
      });
      formData.append('product_info', JSON.stringify(productInfo));
    }

    // Append variant_specs if available
    const variantSpecsArray = this.productForm.get('variant_specs') as FormArray;
    if (variantSpecsArray && variantSpecsArray.length > 0) {
      const variantSpecs = variantSpecsArray.controls.map(control => control.value);
      formData.append('variant_specs', JSON.stringify(variantSpecs));
    }

    // Append colors if available
    const colorsArray = this.productForm.get('colors') as FormArray;
    if (colorsArray && colorsArray.length > 0) {
      const colors = colorsArray.controls.map(control => control.value);
      formData.append('colors', JSON.stringify(colors));
    }

    // Append thumbnail with filename and content_type
    if (this.thumbnailFile) {
      const file = this.thumbnailFile as File;  // Type assertion
      formData.append('thumbnail', file, file.name);
      formData.append('thumbnail_filename', file.name);
      formData.append('thumbnail_content_type', file.type);
    }

    // Append images with filenames and content_types
    if (this.imageFiles && this.imageFiles.length > 0) {
      this.imageFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file, file.name);
        formData.append(`image_filename_${index}`, file.name);
        formData.append(`image_content_type_${index}`, file.type);
      });
      formData.append('image_count', this.imageFiles.length.toString());
    }

    // Append videos with filenames and content_types
    if (this.videoFiles && this.videoFiles.length > 0) {
      this.videoFiles.forEach((file, index) => {
        formData.append(`video_${index}`, file, file.name);
        formData.append(`video_filename_${index}`, file.name);
        formData.append(`video_content_type_${index}`, file.type);
      });
      formData.append('video_count', this.videoFiles.length.toString());
    }

    // Log form data for debugging
    console.log('Form data entries:');
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    return formData;
  }
  
  // Create a new product
  createProduct(formData: FormData): void {
    this.productService.createProduct(formData)
      .subscribe({
        next: (response) => {
          console.log('Product created successfully:', response);
          this.submitting = false;
          this.handleSubmitResponse(response);
        },
        error: (error) => {
          console.error('Lỗi khi tạo sản phẩm:', error);
          this.submitting = false;
          
          if (error.status === 400 && error.error && error.error.message) {
            this.errorMessage = `Lỗi: ${error.error.message}`;
          } else {
            this.errorMessage = 'Không thể tạo sản phẩm. Vui lòng kiểm tra các trường và thử lại.';
          }
          
          // Scroll to top to show error message
          window.scrollTo(0, 0);
        }
      });
  }
  
  // Update an existing product
  updateProduct(formData: FormData): void {
    this.productService.updateProduct(this.productId, formData)
      .subscribe({
        next: (response) => {
          console.log('Product updated successfully:', response);
          this.submitting = false;
          this.handleSubmitResponse(response);
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật sản phẩm:', error);
          this.submitting = false;
          
          if (error.status === 400 && error.error && error.error.message) {
            this.errorMessage = `Lỗi: ${error.error.message}`;
          } else {
            this.errorMessage = 'Không thể cập nhật sản phẩm. Vui lòng kiểm tra các trường và thử lại.';
          }
          
          // Scroll to top to show error message
          window.scrollTo(0, 0);
        }
      });
  }

  // Methods for variant specs
  addVariantSpec(): void {
    const variantSpecGroup = this.fb.group({
      name: ['', Validators.required],
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
      price: [0, [Validators.required, Validators.min(1000)]],
      discount_percent: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    
    this.variantSpecsArray.push(variantSpecGroup);
  }

  removeVariantSpec(index: number): void {
    this.variantSpecsArray.removeAt(index);
  }

  getVariantSpecPortsArray(index: number): FormArray {
    return (this.variantSpecsArray.at(index).get('specs') as FormGroup).get('ports') as FormArray;
  }

  addVariantPort(variantIndex: number): void {
    this.getVariantSpecPortsArray(variantIndex).push(this.fb.control(''));
  }

  removeVariantPort(variantIndex: number, portIndex: number): void {
    const portsArray = this.getVariantSpecPortsArray(variantIndex);
    if (portsArray.length > 1) {
      portsArray.removeAt(portIndex);
    }
  }

  // Methods for colors
  addColor(): void {
    const colorGroup = this.fb.group({
      name: ['', Validators.required],
      code: ['#000000', Validators.required],
      price_adjustment: [0],
      discount_adjustment: [0],
      images: [[]]
    });
    
    this.colorsArray.push(colorGroup);
  }

  removeColor(index: number): void {
    this.colorsArray.removeAt(index);
  }

  // Methods for product info
  addProductInfo(): void {
    const productInfoGroup = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
    
    this.productInfoArray.push(productInfoGroup);
  }

  removeProductInfo(index: number): void {
    this.productInfoArray.removeAt(index);
  }

  // Methods for highlights
  addHighlight(): void {
    this.highlightsArray.push(this.fb.control('', Validators.required));
  }

  removeHighlight(index: number): void {
    this.highlightsArray.removeAt(index);
  }

  // Check if a file is a video based on URL or file extension
  isVideoFile(url: string): boolean {
    return url.toLowerCase().endsWith('.mp4') || 
           url.toLowerCase().endsWith('.webm') || 
           url.toLowerCase().endsWith('.ogg');
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bMQ0AIAwAwQJ+ZuFnBt5hYeJxN3DptGa27ae7I/Y+DnCDIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhGSGZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIRkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZkhmSEZIZk/aCYQAWAEEFwAAAAASUVORK5CYII=';
    
    // Add a tooltip or text to indicate the file is missing
    const parent = img.parentElement;
    if (parent) {
      const tooltip = document.createElement('div');
      tooltip.className = 'missing-file-tooltip';
      tooltip.textContent = 'Hình ảnh không tồn tại trong cơ sở dữ liệu';
      tooltip.style.position = 'absolute';
      tooltip.style.bottom = '0';
      tooltip.style.left = '0';
      tooltip.style.right = '0';
      tooltip.style.backgroundColor = 'rgba(220, 53, 69, 0.8)';
      tooltip.style.color = 'white';
      tooltip.style.fontSize = '11px';
      tooltip.style.padding = '2px 5px';
      tooltip.style.textAlign = 'center';
      parent.style.position = 'relative';
      parent.appendChild(tooltip);
      
      // Log to console for debugging
      console.warn('GridFS file not found: ', img.src);
    }
  }

  handleVideoError(event: Event): void {
    const video = event.target as HTMLVideoElement;
    // Replace with a placeholder or hide the video
    video.style.display = 'none';
    
    // Add a placeholder div with text
    const parent = video.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'video-error-placeholder';
      placeholder.textContent = 'Video không tồn tại trong cơ sở dữ liệu';
      placeholder.style.width = '320px';
      placeholder.style.height = '180px';
      placeholder.style.backgroundColor = '#dc3545';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.color = 'white';
      placeholder.style.fontSize = '14px';
      placeholder.style.fontWeight = 'bold';
      parent.appendChild(placeholder);
      
      // Log to console for debugging
      console.warn('GridFS video file not found', video.querySelector('source')?.src);
    }
  }
} 