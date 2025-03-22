import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ReportService, TopSellingProduct, CategoryStatistics, InventoryStatus, ProductSalesTrend } from '../../../core/services/report.service';

// Mock data for testing when API is not available
const MOCK_TOP_SELLING_PRODUCTS: TopSellingProduct[] = [
  {
    product_id: "60d21b4667d0d8992e610c85",
    name: "iPhone 13 Pro",
    brand: "Apple",
    total_sales: 45,
    total_revenue: 44955.00,
    current_stock: 22
  },
  {
    product_id: "60d21b4667d0d8992e610c86",
    name: "Samsung Galaxy S21",
    brand: "Samsung",
    total_sales: 38,
    total_revenue: 30400.00,
    current_stock: 15
  },
  {
    product_id: "60d21b4667d0d8992e610c87",
    name: "MacBook Pro M1",
    brand: "Apple",
    total_sales: 30,
    total_revenue: 60000.00,
    current_stock: 10
  }
];

const MOCK_CATEGORY_STATISTICS: CategoryStatistics[] = [
  {
    category_id: "60d21b4667d0d8992e610c70",
    name: "Smartphones",
    total_products: 15,
    total_sales: 120,
    total_revenue: 95600.00
  },
  {
    category_id: "60d21b4667d0d8992e610c71",
    name: "Laptops",
    total_products: 8,
    total_sales: 45,
    total_revenue: 67500.00
  }
];

const MOCK_INVENTORY_STATUS: InventoryStatus = {
  summary: {
    total_products: 45,
    total_value: 225000.00,
    low_stock_count: 5,
    out_of_stock_count: 3,
    in_stock_count: 42
  },
  low_stock_products: [
    {
      product_id: "60d21b4667d0d8992e610c85",
      name: "iPhone 13 Pro",
      brand: "Apple",
      current_stock: 3,
      status: "available"
    }
  ],
  out_of_stock_products: [
    {
      product_id: "60d21b4667d0d8992e610c90",
      name: "Google Pixel 6",
      brand: "Google",
      current_stock: 0,
      status: "out_of_stock"
    }
  ]
};

const MOCK_SALES_TRENDS: ProductSalesTrend[] = [
  {
    period: "2023-01",
    products: [
      {
        product_id: "60d21b4667d0d8992e610c85",
        name: "iPhone 13 Pro",
        quantity: 12,
        revenue: 11988.00
      },
      {
        product_id: "60d21b4667d0d8992e610c86",
        name: "Samsung Galaxy S21",
        quantity: 8,
        revenue: 6400.00
      }
    ]
  },
  {
    period: "2023-02",
    products: [
      {
        product_id: "60d21b4667d0d8992e610c85",
        name: "iPhone 13 Pro",
        quantity: 15,
        revenue: 14985.00
      },
      {
        product_id: "60d21b4667d0d8992e610c86",
        name: "Samsung Galaxy S21",
        quantity: 10,
        revenue: 8000.00
      }
    ]
  }
];

@Component({
  selector: 'app-product-report-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NgxChartsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './product-report-dashboard.component.html',
  styleUrl: './product-report-dashboard.component.scss'
})
export class ProductReportDashboardComponent implements OnInit {
  // Period selection options
  periods = [
    { value: 'daily', label: 'Hôm nay' },
    { value: 'weekly', label: 'Tuần này' },
    { value: 'monthly', label: 'Tháng này' },
    { value: 'yearly', label: 'Năm nay' },
    { value: 'custom', label: 'Tùy chỉnh' }
  ];
  selectedPeriod = 'monthly';
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Data containers
  topSellingProducts: TopSellingProduct[] = [];
  categoryStatistics: CategoryStatistics[] = [];
  inventoryStatus: InventoryStatus | null = null;
  salesTrends: ProductSalesTrend[] = [];

  // Table columns
  topSellingColumns: string[] = ['name', 'brand', 'total_sales', 'total_revenue', 'current_stock'];
  categoryColumns: string[] = ['name', 'total_products', 'total_sales', 'total_revenue'];
  inventoryColumns: string[] = ['name', 'brand', 'current_stock', 'status'];
  salesTrendsColumns: string[] = ['period', 'products', 'total_quantity', 'total_revenue'];
  
  // Loading states
  isLoadingTopSelling = false;
  isLoadingCategories = false;
  isLoadingInventory = false;
  isLoadingSalesTrends = false;

  // Error states
  apiAvailable = true;

  // Chart options
  salesChartData: any[] = [];
  categoryChartData: any[] = [];
  view: [number, number] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Sản phẩm';
  yAxisLabel = 'Số lượng bán';
  
  constructor(
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAllReports();
  }

  loadAllReports(): void {
    this.loadTopSellingProducts();
    this.loadCategoryStatistics();
    this.loadInventoryStatus();
    this.loadSalesTrends();
  }

  onPeriodChange(): void {
    if (this.selectedPeriod !== 'custom') {
      this.startDate = null;
      this.endDate = null;
      this.loadAllReports();
    }
  }

  applyDateFilter(): void {
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      this.loadAllReports();
    }
  }

  loadTopSellingProducts(): void {
    this.isLoadingTopSelling = true;
    const params: any = { period: this.selectedPeriod };
    
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      params.start_date = this.formatDate(this.startDate);
      params.end_date = this.formatDate(this.endDate);
    }
    
    this.reportService.getTopSellingProducts(params)
      .pipe(
        catchError(error => {
          console.error('Error loading top selling products:', error);
          this.apiAvailable = false;
          this.showError('API đang không khả dụng. Hiển thị dữ liệu mẫu.');
          return of({ success: true, message: 'Mock data', data: MOCK_TOP_SELLING_PRODUCTS });
        })
      )
      .subscribe({
        next: (response) => {
          this.topSellingProducts = response.data;
          this.prepareSalesChartData();
          this.isLoadingTopSelling = false;
        }
      });
  }

  loadCategoryStatistics(): void {
    this.isLoadingCategories = true;
    const params: any = { period: this.selectedPeriod };
    
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      params.start_date = this.formatDate(this.startDate);
      params.end_date = this.formatDate(this.endDate);
    }
    
    this.reportService.getProductStatisticsByCategory(params)
      .pipe(
        catchError(error => {
          console.error('Error loading category statistics:', error);
          if (this.apiAvailable) {
            this.apiAvailable = false;
            this.showError('API đang không khả dụng. Hiển thị dữ liệu mẫu.');
          }
          return of({ success: true, message: 'Mock data', data: MOCK_CATEGORY_STATISTICS });
        })
      )
      .subscribe({
        next: (response) => {
          this.categoryStatistics = response.data;
          this.prepareCategoryChartData();
          this.isLoadingCategories = false;
        }
      });
  }

  loadInventoryStatus(): void {
    this.isLoadingInventory = true;
    this.reportService.getInventoryStatus()
      .pipe(
        catchError(error => {
          console.error('Error loading inventory status:', error);
          if (this.apiAvailable) {
            this.apiAvailable = false;
            this.showError('API đang không khả dụng. Hiển thị dữ liệu mẫu.');
          }
          return of({ success: true, message: 'Mock data', data: MOCK_INVENTORY_STATUS });
        })
      )
      .subscribe({
        next: (response) => {
          this.inventoryStatus = response.data;
          this.isLoadingInventory = false;
        }
      });
  }

  loadSalesTrends(): void {
    this.isLoadingSalesTrends = true;
    const params: any = { period: this.selectedPeriod };
    
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      params.start_date = this.formatDate(this.startDate);
      params.end_date = this.formatDate(this.endDate);
    }
    
    this.reportService.getProductSalesTrends(params)
      .pipe(
        catchError(error => {
          console.error('Error loading sales trends:', error);
          if (this.apiAvailable) {
            this.apiAvailable = false;
            this.showError('API đang không khả dụng. Hiển thị dữ liệu mẫu.');
          }
          return of({ success: true, message: 'Mock data', data: MOCK_SALES_TRENDS });
        })
      )
      .subscribe({
        next: (response) => {
          this.salesTrends = response.data;
          this.isLoadingSalesTrends = false;
        }
      });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  prepareSalesChartData(): void {
    this.salesChartData = this.topSellingProducts.map(product => {
      return {
        name: product.name,
        value: product.total_sales
      };
    });
  }

  prepareCategoryChartData(): void {
    this.categoryChartData = this.categoryStatistics.map(category => {
      return {
        name: category.name,
        value: category.total_sales
      };
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  calculateTotalQuantity(salesTrend: ProductSalesTrend): number {
    return salesTrend.products.reduce((total, product) => total + product.quantity, 0);
  }

  calculateTotalRevenue(salesTrend: ProductSalesTrend): number {
    return salesTrend.products.reduce((total, product) => total + product.revenue, 0);
  }
}
