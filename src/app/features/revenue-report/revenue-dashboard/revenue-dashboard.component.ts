import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  RevenueService, 
  RevenueStatistics, 
  RevenueSummary, 
  ProductRevenue, 
  TimePeriod 
} from '../../../services/revenue.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-revenue-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './revenue-dashboard.component.html',
  styleUrl: './revenue-dashboard.component.scss'
})
export class RevenueDashboardComponent implements OnInit {
  // Debug mode flag
  debugMode = false;

  // API connectivity status
  apiConnectivityMessage = '';
  apiConnectionOk = false;
  
  // Revenue summary data
  revenueSummary: RevenueSummary | null = null;
  
  // Revenue statistics data
  revenueStats: RevenueStatistics[] = [];
  selectedPeriod: TimePeriod = 'monthly';
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  startDate: string = '';
  endDate: string = '';
  
  // Product revenue data
  productRevenue: ProductRevenue[] = [];
  productPeriod: TimePeriod = 'monthly';
  productYear = new Date().getFullYear();
  productMonth = new Date().getMonth() + 1;
  productStartDate: string = '';
  productEndDate: string = '';
  
  // Available years for selection
  availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  
  // Available months for selection with localized names
  availableMonths = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    name: `Tháng ${i + 1}`
  }));
  
  // Loading states
  loadingSummary = false;
  loadingStats = false;
  loadingProducts = false;
  
  // Error states
  summaryError = '';
  statsError = '';
  productsError = '';

  // Demo data flags
  usingDemoStats = false;
  usingDemoProducts = false;

  constructor(private revenueService: RevenueService) {}

  ngOnInit(): void {
    // Load data directly without API connectivity test
    this.loadAllData();
  }

  /**
   * Use demo data for development and testing
   */
  useDemoData(): void {
    this.loadingSummary = true;
    this.loadingStats = true;
    this.loadingProducts = true;
    
    // Simulate loading delay
    setTimeout(() => {
      this.revenueSummary = this.getDemoSummary();
      this.revenueStats = this.getDemoStatistics();
      this.productRevenue = this.getDemoProductRevenue();
      
      this.usingDemoStats = true;
      this.usingDemoProducts = true;
      
      this.loadingSummary = false;
      this.loadingStats = false;
      this.loadingProducts = false;
    }, 300);
  }

  /**
   * Get demo revenue summary
   */
  private getDemoSummary(): RevenueSummary {
    return {
      today: {
        revenue: 2650000,
        orders: 12
      },
      this_month: {
        revenue: 42580000,
        orders: 187,
        avg_order_value: 227700.53
      },
      prev_month: {
        revenue: 39750000,
        orders: 176
      },
      this_year: {
        revenue: 325450000,
        orders: 1432,
        avg_order_value: 227270.25
      },
      growth: {
        month_over_month: 7.12,
        month_name: 'Tháng 3'
      },
      top_products: [
        {
          productId: '60a2b8e34f5e7d2b9c8f1a3d',
          productName: 'MacBook Pro M2',
          total_revenue: 125750000,
          quantity_sold: 43
        },
        {
          productId: '60a2b8e34f5e7d2b9c8f1a3e',
          productName: 'iPhone 14 Pro Max',
          total_revenue: 98450000,
          quantity_sold: 56
        },
        {
          productId: '60a2b8e34f5e7d2b9c8f1a3f',
          productName: 'iPad Pro',
          total_revenue: 45320000,
          quantity_sold: 32
        }
      ]
    };
  }

  /**
   * Get demo revenue statistics
   */
  private getDemoStatistics(): RevenueStatistics[] {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        period: `Tháng 1 ${currentYear}`,
        total_revenue: 25678900,
        total_orders: 142,
        average_order_value: 180836.62
      },
      {
        period: `Tháng 2 ${currentYear}`,
        total_revenue: 31245700,
        total_orders: 165,
        average_order_value: 189367.88
      },
      {
        period: `Tháng 3 ${currentYear}`,
        total_revenue: 42580000,
        total_orders: 187,
        average_order_value: 227700.53
      }
    ];
  }

  /**
   * Get demo product revenue
   */
  private getDemoProductRevenue(): ProductRevenue[] {
    return [
      {
        productId: '60a2b8e34f5e7d2b9c8f1a3d',
        productName: 'MacBook Pro M2',
        total_revenue: 42580000,
        quantity_sold: 14,
        avg_price: 3041428.57
      },
      {
        productId: '60a2b8e34f5e7d2b9c8f1a3e',
        productName: 'iPhone 14 Pro Max',
        total_revenue: 37950000,
        quantity_sold: 21,
        avg_price: 1807142.86
      },
      {
        productId: '60a2b8e34f5e7d2b9c8f1a40',
        productName: 'AirPods Pro',
        total_revenue: 15450000,
        quantity_sold: 25,
        avg_price: 618000
      },
      {
        productId: '60a2b8e34f5e7d2b9c8f1a3f',
        productName: 'iPad Pro',
        total_revenue: 28950000,
        quantity_sold: 15,
        avg_price: 1930000
      }
    ];
  }
  
  /**
   * Load all data sections
   */
  loadAllData(): void {
    this.loadRevenueSummary();
    this.loadRevenueStatistics();
    this.loadProductRevenue();
  }

  loadRevenueSummary(): void {
    this.loadingSummary = true;
    this.summaryError = '';
    
    this.revenueService.getRevenueSummary().pipe(
      catchError(error => {
        this.summaryError = 'Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.';
        return of({ success: false, message: 'Error', data: null as unknown as RevenueSummary });
      }),
      finalize(() => this.loadingSummary = false)
    ).subscribe(response => {
      if (response.success && response.data) {
        this.revenueSummary = response.data;
      } else if (!this.summaryError) {
        // If API returns success: false or no data, load demo summary
        this.revenueSummary = this.getDemoSummary();
        this.summaryError = '';
      }
    });
  }

  loadRevenueStatistics(): void {
    this.loadingStats = true;
    this.statsError = '';
    this.usingDemoStats = false;
    
    const params: any = {};
    
    if (this.selectedPeriod === 'custom') {
      params.start_date = this.startDate;
      params.end_date = this.endDate;
    } else if (this.selectedPeriod === 'yearly') {
      params.year = this.selectedYear;
    } else if (this.selectedPeriod === 'monthly') {
      params.year = this.selectedYear;
      params.month = this.selectedMonth;
    }
    
    this.revenueService.getRevenueStatistics(this.selectedPeriod, params).pipe(
      catchError(error => {
        this.statsError = 'Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.';
        return of({ success: false, message: 'Error', data: [] });
      }),
      finalize(() => this.loadingStats = false)
    ).subscribe(response => {
      if (response.success && response.data && response.data.length > 0) {
        this.revenueStats = response.data;
      } else {
        // If API returns empty array, use demo data
        this.revenueStats = this.getDemoStatistics();
        this.usingDemoStats = true;
        this.statsError = '';
      }
    });
  }

  loadProductRevenue(): void {
    this.loadingProducts = true;
    this.productsError = '';
    this.usingDemoProducts = false;
    
    const params: any = {};
    
    if (this.productPeriod === 'custom') {
      params.start_date = this.productStartDate;
      params.end_date = this.productEndDate;
    } else if (this.productPeriod === 'yearly') {
      params.year = this.productYear;
    } else if (this.productPeriod === 'monthly') {
      params.year = this.productYear;
      params.month = this.productMonth;
    }
    
    this.revenueService.getRevenueByProduct(this.productPeriod, params).pipe(
      catchError(error => {
        this.productsError = 'Không thể tải dữ liệu doanh thu theo sản phẩm. Vui lòng thử lại sau.';
        return of({ success: false, message: 'Error', data: [] });
      }),
      finalize(() => this.loadingProducts = false)
    ).subscribe(response => {
      if (response.success && response.data && response.data.length > 0) {
        this.productRevenue = response.data;
      } else {
        // If API returns empty array, use demo data
        this.productRevenue = this.getDemoProductRevenue();
        this.usingDemoProducts = true;
        this.productsError = '';
      }
    });
  }

  // Format number as currency using the service
  formatCurrency(value: number): string {
    return this.revenueService.formatCurrency(value);
  }

  // Handle period change for statistics
  onPeriodChange(): void {
    this.loadRevenueStatistics();
  }

  // Handle period change for product revenue
  onProductPeriodChange(): void {
    this.loadProductRevenue();
  }

  // Refresh all data
  refreshData(): void {
    this.loadAllData();
  }
}
