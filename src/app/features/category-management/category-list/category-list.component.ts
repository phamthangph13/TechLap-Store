import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CategoryService, Category } from '../../../core/services/category.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  editMode = false;
  currentCategoryId: string | null = null;
  loading = false;
  error = '';
  success = '';

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.error = 'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra kết nối hoặc liên hệ quản trị viên.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const categoryData: Category = this.categoryForm.value;
    console.log('Sending category data:', JSON.stringify(categoryData));
    this.loading = true;

    if (this.editMode && this.currentCategoryId) {
      this.categoryService.updateCategory(this.currentCategoryId, categoryData).subscribe({
        next: () => {
          this.success = 'Cập nhật danh mục thành công!';
          this.loadCategories();
          this.resetForm();
        },
        error: (err) => {
          this.error = 'Lỗi khi cập nhật danh mục';
          this.loading = false;
          console.error('Update category error details:', err.status, err.error);
        }
      });
    } else {
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          this.success = 'Thêm danh mục thành công!';
          this.loadCategories();
          this.resetForm();
        },
        error: (err) => {
          this.error = 'Lỗi khi thêm danh mục';
          this.loading = false;
          console.error('Create category error details:', err.status, err.error);
        }
      });
    }
  }

  editCategory(category: Category): void {
    this.editMode = true;
    this.currentCategoryId = category._id || null;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
  }

  deleteCategory(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      this.loading = true;
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.success = 'Xóa danh mục thành công!';
          this.loadCategories();
        },
        error: (err) => {
          this.error = 'Lỗi khi xóa danh mục';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  resetForm(): void {
    this.categoryForm.reset();
    this.editMode = false;
    this.currentCategoryId = null;
    this.loading = false;
    this.error = '';
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      this.success = '';
    }, 3000);
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }
}
