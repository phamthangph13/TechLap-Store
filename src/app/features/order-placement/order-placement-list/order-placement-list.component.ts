import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-placement-list',
  templateUrl: './order-placement-list.component.html',
  styleUrls: ['./order-placement-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class OrderPlacementListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalOrders = 0;
  totalPages = 1;
  
  // Filters
  filterForm!: FormGroup;
  statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đã giao hàng' },
    { value: 'delivered', label: 'Đã nhận hàng' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];
  
  // Selected order for detail view or action
  selectedOrder: Order | null = null;
  isViewingDetails = false;
  
  // Order status update
  isUpdatingStatus = false;
  updateStatusSuccess = false;
  updateStatusError = '';
  
  // Lưu trữ hàm xử lý sự kiện phím để có thể xóa sau này
  private escapeKeyHandler: (event: KeyboardEvent) => void;
  
  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Tạo hàm xử lý sự kiện phím và bind this
    this.escapeKeyHandler = this.handleEscapeKey.bind(this);
  }
  
  ngOnInit(): void {
    this.initFilterForm();
    this.loadOrders();
    
    // Đăng ký sự kiện lắng nghe phím Escape
    document.addEventListener('keydown', this.escapeKeyHandler);
  }
  
  ngOnDestroy(): void {
    // Xóa sự kiện lắng nghe khi component bị hủy
    document.removeEventListener('keydown', this.escapeKeyHandler);
  }
  
  // Xử lý sự kiện phím Escape
  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isViewingDetails) {
      this.closeDetails();
    }
  }
  
  initFilterForm(): void {
    this.filterForm = this.fb.group({
      status: [''],
      customerEmail: [''],
      customerPhone: [''],
      dateFrom: [''],
      dateTo: ['']
    });
    
    // Subscribe to form changes to auto-filter
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const filters = this.filterForm.value;
    
    this.orderService.getOrders(
      this.currentPage,
      this.pageSize,
      filters.status,
      filters.customerEmail,
      filters.customerPhone,
      filters.dateFrom,
      filters.dateTo,
      'orderDate',
      'desc'
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          // Kiểm tra cấu trúc của response.data
          if (Array.isArray(response.data)) {
            // Cấu trúc cũ hoặc mock data (data trực tiếp là mảng Order[])
            this.orders = response.data as Order[];
            this.filteredOrders = [...this.orders];
            
            if (response.pagination) {
              this.totalOrders = response.pagination.total;
              this.totalPages = response.pagination.pages;
            }
          } else if (response.data && typeof response.data === 'object' && Array.isArray((response.data as any).orders)) {
            // Cấu trúc API thực tế (data là object có thuộc tính orders là mảng)
            const data = response.data as any;
            this.orders = data.orders;
            this.filteredOrders = [...this.orders];
            
            // Sử dụng pagination từ data object
            if (data.pagination) {
              this.totalOrders = data.pagination.total;
              this.totalPages = data.pagination.pages;
            }
          } else {
            this.errorMessage = 'Định dạng dữ liệu không hợp lệ';
            this.orders = [];
            this.filteredOrders = [];
          }
        } else {
          this.errorMessage = response.message || 'Không thể tải danh sách đơn hàng';
          this.orders = [];
          this.filteredOrders = [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Đã xảy ra lỗi khi tải danh sách đơn hàng';
        this.orders = [];
        this.filteredOrders = [];
      }
    });
  }
  
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when applying new filters
    this.loadOrders();
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      status: '',
      customerEmail: '',
      customerPhone: '',
      dateFrom: '',
      dateTo: ''
    });
    
    this.loadOrders();
  }
  
  pageChanged(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }
  
  viewOrderDetails(order: Order): void {
    // Set the selectedOrder immediately for better UX
    this.selectedOrder = order;
    this.isViewingDetails = true;
    
    // Call API to get full order details
    this.orderService.getOrderById(order._id!).subscribe({
      next: (response) => {
        if (response.success) {
          // Handle different API response structures
          if (typeof response.data === 'object' && !Array.isArray(response.data)) {
            if ((response.data as any).status !== undefined) {
              // Direct order object
              this.selectedOrder = response.data as Order;
            } else if ((response.data as any).order !== undefined) {
              // {order: {...}} structure
              this.selectedOrder = (response.data as any).order as Order;
            }
          }
        } else {
          console.error('Failed to fetch order details:', response.message);
        }
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
      }
    });
  }
  
  closeDetails(): void {
    try {
      console.log('Closing order details modal');
      this.selectedOrder = null;
      this.isViewingDetails = false;
      this.updateStatusSuccess = false;
      this.updateStatusError = '';
      this.isUpdatingStatus = false;
      
      // Đảm bảo Angular phát hiện thay đổi
      setTimeout(() => {
        console.log('Modal closed, isViewingDetails:', this.isViewingDetails);
      }, 0);
    } catch (error) {
      console.error('Error while closing modal:', error);
    }
  }
  
  updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    this.isUpdatingStatus = true;
    this.updateStatusSuccess = false;
    this.updateStatusError = '';
    
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (response) => {
        this.isUpdatingStatus = false;
        
        if (response.success) {
          this.updateStatusSuccess = true;
          
          // Xử lý dữ liệu trả về từ API
          let updatedOrder: Order | null = null;
          
          if (typeof response.data === 'object' && !Array.isArray(response.data)) {
            if ((response.data as any).status !== undefined) {
              // Trường hợp API trả về order trực tiếp trong data
              updatedOrder = response.data as Order;
            } else if ((response.data as any).order !== undefined) {
              // Trường hợp API trả về {order: {...}} 
              updatedOrder = (response.data as any).order as Order;
            }
          }
          
          if (updatedOrder) {
            // Update the order in the local array
            const index = this.orders.findIndex(order => order._id === orderId);
            if (index !== -1) {
              this.orders[index] = updatedOrder;
              this.filteredOrders = [...this.orders];
            }
            
            // Refresh order details if selected
            if (this.selectedOrder && this.selectedOrder._id === orderId) {
              this.selectedOrder = updatedOrder;
            }
          } else {
            // Fallback to just updating the status
            // Update the order in the local array
            const index = this.orders.findIndex(order => order._id === orderId);
            if (index !== -1) {
              this.orders[index].status = newStatus;
              this.filteredOrders = [...this.orders];
            }
            
            // Refresh order details if selected
            if (this.selectedOrder && this.selectedOrder._id === orderId) {
              this.selectedOrder.status = newStatus;
            }
          }
          
          // Reload orders after a delay
          setTimeout(() => {
            this.loadOrders();
            this.updateStatusSuccess = false;
          }, 2000);
        } else {
          this.updateStatusError = response.message || 'Không thể cập nhật trạng thái đơn hàng';
        }
      },
      error: (error) => {
        this.isUpdatingStatus = false;
        this.updateStatusError = error.error?.message || 'Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng';
      }
    });
  }
  
  cancelOrder(orderId: string): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: (response) => {
          if (response.success) {
            // Có hai khả năng:
            // 1. API trả về thông báo thành công và chúng ta cần tải lại danh sách
            // 2. API trả về order đã được cập nhật
            
            let updatedOrder: Order | null = null;
            
            if (typeof response.data === 'object' && !Array.isArray(response.data)) {
              if ((response.data as any).status !== undefined) {
                // Trường hợp API trả về order trực tiếp trong data
                updatedOrder = response.data as Order;
              } else if ((response.data as any).order !== undefined) {
                // Trường hợp API trả về {order: {...}} 
                updatedOrder = (response.data as any).order as Order;
              }
            }
            
            if (updatedOrder) {
              // Update the order in the local array
              const index = this.orders.findIndex(order => order._id === orderId);
              if (index !== -1) {
                this.orders[index] = updatedOrder;
                this.filteredOrders = [...this.orders];
              }
              
              // Close details if the cancelled order was selected
              if (this.selectedOrder && this.selectedOrder._id === orderId) {
                this.closeDetails();
              }
            } else {
              // Reload orders
              this.loadOrders();
              
              // Close details if the cancelled order was selected
              if (this.selectedOrder && this.selectedOrder._id === orderId) {
                this.closeDetails();
              }
            }
          } else {
            alert('Không thể hủy đơn hàng: ' + response.message);
          }
        },
        error: (error) => {
          alert('Đã xảy ra lỗi khi hủy đơn hàng: ' + (error.error?.message || 'Lỗi không xác định'));
        }
      });
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  
  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'pending': return 'badge bg-warning text-dark';
      case 'processing': return 'badge bg-info text-dark';
      case 'shipped': return 'badge bg-primary';
      case 'delivered': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
  
  getStatusText(status: OrderStatus): string {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã giao hàng';
      case 'delivered': return 'Đã nhận hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }
  
  // Get next possible statuses based on current status
  getNextPossibleStatuses(currentStatus: OrderStatus): OrderStatus[] {
    switch (currentStatus) {
      case 'pending': return ['processing', 'cancelled'];
      case 'processing': return ['shipped', 'cancelled'];
      case 'shipped': return ['delivered', 'cancelled'];
      case 'delivered': return []; // End state, no next status
      case 'cancelled': return []; // End state, no next status
      default: return [];
    }
  }
}
