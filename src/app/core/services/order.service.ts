import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Order, OrderPlacement, OrderResponse, OrderStatus } from '../models/order.model';
import { catchError, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';
  
  // Mock data for development/testing
  private mockOrders: Order[] = [
    {
      _id: '1',
      orderNumber: 'TS-20230724-001',
      customer: {
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'nguyenvana@example.com'
      },
      shippingAddress: {
        province: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        streetAddress: '123 Nguyễn Huệ'
      },
      items: [
        {
          productId: '67deaf2d7457268626f9e0eb',
          productName: 'MacBook Pro 16',
          basePrice: 58000000,
          variantName: 'APPLE M3',
          variantSpecs: {
            cpu: 'M3 INTEL',
            ram: '64GB',
            storage: '2TB',
            display: '17.0 ICNH',
            gpu: 'OLED',
            battery: '1000KW',
            os: 'MAC M3',
            ports: ['USB-C', 'HDMI']
          },
          variantPrice: 75000000,
          variantDiscountPercent: 5,
          colorName: 'Silver',
          colorCode: '#cfc9c9',
          colorPriceAdjustment: 170000,
          colorDiscountAdjustment: 0,
          quantity: 1,
          unitPrice: 75170000,
          discountedPrice: 71411500,
          subtotal: 71411500,
          thumbnailUrl: '67deaf2d7457268626f9e0ca'
        }
      ],
      payment: {
        method: 'COD',
        status: 'pending'
      },
      productInfo: [
        {
          title: 'Bảo hành',
          content: 'bảo hành trong vòng 24 tháng'
        },
        {
          title: 'Free ship',
          content: 'miễn phí vẫn chuyện ngoại thành và nội thành'
        }
      ],
      subtotal: 71411500,
      discountTotal: 3758500,
      shippingFee: 0,
      total: 71411500,
      status: 'pending',
      orderDate: '2023-07-24T10:30:00.000Z',
      updatedAt: '2023-07-24T10:30:00.000Z'
    },
    {
      _id: '2',
      orderNumber: 'TS-20230724-002',
      customer: {
        fullName: 'Trần Thị B',
        phone: '0912345678',
        email: 'tranthib@example.com'
      },
      shippingAddress: {
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        ward: 'Dịch Vọng',
        streetAddress: '45 Xuân Thủy'
      },
      items: [
        {
          productId: '67deaf2d7457268626f9e0ec',
          productName: 'iPhone 15 Pro',
          basePrice: 28000000,
          variantName: '256GB',
          colorName: 'Titanium Blue',
          colorCode: '#4F7CAC',
          quantity: 1,
          unitPrice: 28000000,
          discountedPrice: 26600000,
          subtotal: 26600000
        }
      ],
      payment: {
        method: 'BANK_TRANSFER',
        status: 'completed'
      },
      subtotal: 26600000,
      discountTotal: 1400000,
      shippingFee: 0,
      total: 26600000,
      status: 'delivered',
      orderDate: '2023-07-25T14:45:00.000Z',
      updatedAt: '2023-07-28T09:30:00.000Z'
    },
    {
      _id: '3',
      orderNumber: 'TS-20230726-001',
      customer: {
        fullName: 'Lê Văn C',
        phone: '0978123456',
        email: 'levanc@example.com'
      },
      shippingAddress: {
        province: 'Đà Nẵng',
        district: 'Hải Châu',
        ward: 'Thanh Bình',
        streetAddress: '56 Trần Phú'
      },
      items: [
        {
          productId: '67deaf2d7457268626f9e0ed',
          productName: 'Dell XPS 15',
          basePrice: 42000000,
          variantName: 'Core i9',
          variantSpecs: {
            cpu: 'Intel Core i9-13900H',
            ram: '32GB',
            storage: '1TB',
            display: '15.6 inch OLED',
            gpu: 'NVIDIA RTX 4070',
            os: 'Windows 11'
          },
          colorName: 'Silver',
          colorCode: '#E8E8E8',
          quantity: 1,
          unitPrice: 42000000,
          subtotal: 42000000
        }
      ],
      payment: {
        method: 'MOMO',
        status: 'completed'
      },
      subtotal: 42000000,
      shippingFee: 0,
      total: 42000000,
      status: 'shipped',
      orderDate: '2023-07-26T09:15:00.000Z',
      updatedAt: '2023-07-27T11:20:00.000Z'
    }
  ];

  constructor(private http: HttpClient) { }

  // Get all orders with optional filters
  getOrders(
    page?: number,
    limit?: number,
    status?: OrderStatus,
    customerEmail?: string,
    customerPhone?: string,
    dateFrom?: string,
    dateTo?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Observable<OrderResponse> {
    // First try to get from API
    return this.http.get<OrderResponse>(this.apiUrl, { 
      params: this.buildParams(page, limit, status, customerEmail, customerPhone, dateFrom, dateTo, sortBy, sortOrder) 
    }).pipe(
      catchError(error => {
        console.warn('API error, using mock data instead:', error);
        
        // Filter mock data based on parameters
        let filteredOrders = [...this.mockOrders];
        
        if (status) {
          filteredOrders = filteredOrders.filter(order => order.status === status);
        }
        
        if (customerEmail) {
          filteredOrders = filteredOrders.filter(order => 
            order.customer.email.toLowerCase().includes(customerEmail.toLowerCase())
          );
        }
        
        if (customerPhone) {
          filteredOrders = filteredOrders.filter(order => 
            order.customer.phone.includes(customerPhone)
          );
        }
        
        // Calculate pagination
        const actualPage = page || 1;
        const actualLimit = limit || 10;
        const startIndex = (actualPage - 1) * actualLimit;
        const endIndex = startIndex + actualLimit;
        const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
        
        // Create response in the format matching the real API
        const mockResponse: OrderResponse = {
          success: true,
          message: 'Orders retrieved successfully (mock data)',
          data: {
            orders: paginatedOrders,
            pagination: {
              total: filteredOrders.length,
              page: actualPage,
              limit: actualLimit,
              pages: Math.ceil(filteredOrders.length / actualLimit),
              has_next: endIndex < filteredOrders.length,
              has_prev: startIndex > 0
            }
          } as any
        };
        
        // Simulate network delay
        return of(mockResponse).pipe(delay(500));
      })
    );
  }

  // Get a specific order by ID
  getOrderById(orderId: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${orderId}`).pipe(
      catchError(error => {
        console.warn('API error, using mock data instead:', error);
        
        const order = this.mockOrders.find(order => order._id === orderId || order.orderNumber === orderId);
        
        if (order) {
          const response = {
            success: true,
            message: 'Order retrieved successfully (mock data)',
            data: order
          };
          return of(response).pipe(delay(300));
        } else {
          const response = {
            success: false,
            message: 'Order not found',
            data: null as any,
            errors: [`No order with ID or order number: ${orderId}`]
          };
          return of(response).pipe(delay(300));
        }
      })
    );
  }

  // Create a new order
  createOrder(orderData: OrderPlacement): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, orderData).pipe(
      catchError(error => {
        console.warn('API error, using mock data instead:', error);
        
        // Generate a new mock order
        const newOrder: Order = {
          _id: (this.mockOrders.length + 1).toString(),
          orderNumber: `TS-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${(this.mockOrders.length + 1).toString().padStart(3, '0')}`,
          customer: orderData.customer,
          shippingAddress: orderData.shippingAddress,
          items: orderData.items.map(item => ({
            productId: item.productId,
            productName: 'Sample Product', // Mocked product name
            quantity: item.quantity,
            subtotal: 10000000 * item.quantity // Mocked price
          })),
          payment: {
            method: orderData.payment.method,
            status: 'pending'
          },
          subtotal: 10000000,
          shippingFee: 0,
          total: 10000000,
          status: 'pending',
          orderDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add to mock data
        this.mockOrders.push(newOrder);
        
        return of({
          success: true,
          message: 'Order created successfully (mock data)',
          data: newOrder
        }).pipe(delay(500));
      })
    );
  }

  // Update order status
  updateOrderStatus(orderId: string, status: OrderStatus): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${orderId}`, { status }).pipe(
      catchError(error => {
        console.warn('API error, using mock data instead:', error);
        
        const orderIndex = this.mockOrders.findIndex(order => order._id === orderId);
        
        if (orderIndex !== -1) {
          this.mockOrders[orderIndex].status = status;
          this.mockOrders[orderIndex].updatedAt = new Date().toISOString();
          
          const response = {
            success: true,
            message: `Order status updated to '${status}' successfully (mock data)`,
            data: this.mockOrders[orderIndex]
          };
          return of(response).pipe(delay(300));
        } else {
          const response = {
            success: false,
            message: 'Order not found',
            data: null as any,
            errors: [`No order with ID: ${orderId}`]
          };
          return of(response).pipe(delay(300));
        }
      })
    );
  }

  // Cancel an order
  cancelOrder(orderId: string): Observable<OrderResponse> {
    return this.http.delete<OrderResponse>(`${this.apiUrl}/${orderId}`).pipe(
      catchError(error => {
        console.warn('API error, using mock data instead:', error);
        
        const orderIndex = this.mockOrders.findIndex(order => order._id === orderId);
        
        if (orderIndex !== -1) {
          this.mockOrders[orderIndex].status = 'cancelled';
          this.mockOrders[orderIndex].updatedAt = new Date().toISOString();
          
          const response = {
            success: true,
            message: 'Order cancelled successfully (mock data)',
            data: this.mockOrders[orderIndex]
          };
          return of(response).pipe(delay(300));
        } else {
          const response = {
            success: false,
            message: 'Order not found',
            data: null as any,
            errors: [`No order with ID: ${orderId}`]
          };
          return of(response).pipe(delay(300));
        }
      })
    );
  }

  // Get orders by customer email
  getOrdersByEmail(email: string, page?: number, limit?: number, status?: OrderStatus): Observable<OrderResponse> {
    let params = this.buildParams(page, limit, status);
    
    return this.http.get<OrderResponse>(`${this.apiUrl}/by-customer/${email}`, { params }).pipe(
      catchError(error => {
        console.warn('API error, using mock data instead:', error);
        
        // Filter by email
        let filteredOrders = this.mockOrders.filter(order => 
          order.customer.email.toLowerCase() === email.toLowerCase()
        );
        
        // Apply status filter if provided
        if (status) {
          filteredOrders = filteredOrders.filter(order => order.status === status);
        }
        
        // Calculate pagination
        const actualPage = page || 1;
        const actualLimit = limit || 10;
        const startIndex = (actualPage - 1) * actualLimit;
        const endIndex = startIndex + actualLimit;
        const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
        
        return of({
          success: true,
          message: 'Orders retrieved successfully (mock data)',
          data: paginatedOrders,
          pagination: {
            total: filteredOrders.length,
            page: actualPage,
            limit: actualLimit,
            pages: Math.ceil(filteredOrders.length / actualLimit),
            has_next: endIndex < filteredOrders.length,
            has_prev: startIndex > 0
          }
        }).pipe(delay(300));
      })
    );
  }

  // Get orders by customer phone
  getOrdersByPhone(phone: string, page?: number, limit?: number, status?: OrderStatus): Observable<OrderResponse> {
    let params = this.buildParams(page, limit, status);
    
    return this.http.get<OrderResponse>(`${this.apiUrl}/by-phone/${phone}`, { params }).pipe(
      catchError(error => {
        console.warn('API error, using mock data instead:', error);
        
        // Filter by phone
        let filteredOrders = this.mockOrders.filter(order => 
          order.customer.phone === phone
        );
        
        // Apply status filter if provided
        if (status) {
          filteredOrders = filteredOrders.filter(order => order.status === status);
        }
        
        // Calculate pagination
        const actualPage = page || 1;
        const actualLimit = limit || 10;
        const startIndex = (actualPage - 1) * actualLimit;
        const endIndex = startIndex + actualLimit;
        const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
        
        return of({
          success: true,
          message: 'Orders retrieved successfully (mock data)',
          data: paginatedOrders,
          pagination: {
            total: filteredOrders.length,
            page: actualPage,
            limit: actualLimit,
            pages: Math.ceil(filteredOrders.length / actualLimit),
            has_next: endIndex < filteredOrders.length,
            has_prev: startIndex > 0
          }
        }).pipe(delay(300));
      })
    );
  }

  // Get order statistics
  getOrderStatistics(): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/statistics`).pipe(
      catchError(error => {
        console.warn('API error, using mock data instead:', error);
        
        // Count orders by status
        const ordersByStatus = {
          pending: this.mockOrders.filter(order => order.status === 'pending').length,
          processing: this.mockOrders.filter(order => order.status === 'processing').length,
          shipped: this.mockOrders.filter(order => order.status === 'shipped').length,
          delivered: this.mockOrders.filter(order => order.status === 'delivered').length,
          cancelled: this.mockOrders.filter(order => order.status === 'cancelled').length
        };
        
        // Calculate total sales
        const totalSales = this.mockOrders.reduce((sum, order) => 
          order.status !== 'cancelled' ? sum + order.total : sum, 0
        );
        
        // Calculate recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = this.mockOrders.filter(order => 
          new Date(order.orderDate as string) >= thirtyDaysAgo
        ).length;
        
        return of({
          success: true,
          message: 'Order statistics retrieved successfully (mock data)',
          data: {
            total_orders: this.mockOrders.length,
            orders_by_status: ordersByStatus,
            total_sales: totalSales,
            recent_orders: recentOrders
          }
        }).pipe(delay(300));
      })
    );
  }
  
  // Helper method to build params
  private buildParams(
    page?: number,
    limit?: number,
    status?: OrderStatus,
    customerEmail?: string,
    customerPhone?: string,
    dateFrom?: string,
    dateTo?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): HttpParams {
    let params = new HttpParams();
    
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (status) params = params.set('status', status);
    if (customerEmail) params = params.set('customer_email', customerEmail);
    if (customerPhone) params = params.set('customer_phone', customerPhone);
    if (dateFrom) params = params.set('date_from', dateFrom);
    if (dateTo) params = params.set('date_to', dateTo);
    if (sortBy) params = params.set('sort_by', sortBy);
    if (sortOrder) params = params.set('sort_order', sortOrder);
    
    return params;
  }
}
