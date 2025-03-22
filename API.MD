# Order Management API Documentation

Tài liệu này mô tả các API quản lý đơn hàng trong hệ thống.

## Endpoints

### 1. Danh sách đơn hàng

Lấy danh sách đơn hàng với phân trang và lọc.

**URL**: `/api/orders`

**Method**: `GET`

**Tham số Query**:

- `page` (không bắt buộc): Số trang (mặc định: 1)
- `limit` (không bắt buộc): Số item mỗi trang (mặc định: 10, tối đa: 100)
- `status` (không bắt buộc): Lọc theo trạng thái đơn hàng ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
- `customer_email` (không bắt buộc): Lọc theo email khách hàng
- `customer_phone` (không bắt buộc): Lọc theo số điện thoại khách hàng
- `date_from` (không bắt buộc): Lọc theo ngày đặt hàng (từ) (định dạng ISO)
- `date_to` (không bắt buộc): Lọc theo ngày đặt hàng (đến) (định dạng ISO)
- `sort_by` (không bắt buộc): Trường để sắp xếp (mặc định: 'orderDate')
- `sort_order` (không bắt buộc): Thứ tự sắp xếp ('asc' hoặc 'desc', mặc định: 'desc')

#### Phản hồi thành công

**Code**: `200 OK`

**Ví dụ nội dung**:

```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "orderNumber": "TS-20230724-001",
        "customer": {
          "fullName": "Nguyễn Văn A",
          "phone": "0901234567",
          "email": "nguyenvana@example.com"
        },
        "status": "pending",
        "total": 71411500,
        "orderDate": "2023-07-24T10:30:00.000Z",
        "updatedAt": "2023-07-24T10:30:00.000Z",
        "items": [
          {
            "productId": "67deaf2d7457268626f9e0eb",
            "productName": "MacBook Pro 16",
            "variantName": "APPLE M3",
            "colorName": "Silver",
            "quantity": 1,
            "subtotal": 71411500
          }
        ]
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

### 2. Chi tiết đơn hàng

Lấy thông tin chi tiết về một đơn hàng cụ thể.

**URL**: `/api/orders/:order_id`

**Method**: `GET`

**Tham số URL**:

- `order_id`: ID hoặc số đơn hàng

#### Phản hồi thành công

**Code**: `200 OK`

**Ví dụ nội dung**:

```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "orderNumber": "TS-20230724-001",
    "customer": {
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@example.com"
    },
    "shippingAddress": {
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "streetAddress": "123 Nguyễn Huệ"
    },
    "items": [
      {
        "productId": "67deaf2d7457268626f9e0eb",
        "productName": "MacBook Pro 16",
        "basePrice": 58000000,
        "variantName": "APPLE M3",
        "variantSpecs": {
          "cpu": "M3 INTEL",
          "ram": "64GB",
          "storage": "2TB",
          "display": "17.0 ICNH",
          "gpu": "OLED",
          "battery": "1000KW",
          "os": "MAC M3",
          "ports": ["USB-C", "HDMI"]
        },
        "variantPrice": 75000000,
        "variantDiscountPercent": 5,
        "colorName": "Silver",
        "colorCode": "#cfc9c9",
        "colorPriceAdjustment": 170000,
        "colorDiscountAdjustment": 0,
        "quantity": 1,
        "unitPrice": 75170000,
        "discountedPrice": 71411500,
        "subtotal": 71411500,
        "thumbnailUrl": "67deaf2d7457268626f9e0ca"
      }
    ],
    "payment": {
      "method": "COD",
      "status": "pending"
    },
    "productInfo": [
      {
        "title": "Bảo hành",
        "content": "bảo hành trong vòng 24 tháng"
      },
      {
        "title": "Free ship",
        "content": "miễn phí vẫn chuyện ngoại thành và nội thành"
      }
    ],
    "subtotal": 71411500,
    "discountTotal": 3758500,
    "shippingFee": 0,
    "total": 71411500,
    "status": "pending",
    "orderDate": "2023-07-24T10:30:00.000Z",
    "updatedAt": "2023-07-24T10:30:00.000Z"
  }
}
```

#### Phản hồi lỗi

**Điều kiện**: Nếu không tìm thấy đơn hàng.

**Code**: `404 NOT FOUND`

**Ví dụ nội dung**:

```json
{
  "success": false,
  "message": "Order not found",
  "errors": ["No order with ID or order number: 60d21b4667d0d8992e610c85"]
}
```

### 3. Cập nhật trạng thái đơn hàng

Cập nhật trạng thái của một đơn hàng.

**URL**: `/api/orders/:order_id`

**Method**: `PATCH`

**Tham số URL**:

- `order_id`: ID hoặc số đơn hàng

**Request Body**:

```json
{
  "status": "processing"
}
```

Các giá trị trạng thái hợp lệ: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

#### Phản hồi thành công

**Code**: `200 OK`

**Ví dụ nội dung**:

```json
{
  "success": true,
  "message": "Order status updated to 'processing' successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c85",
    "orderNumber": "TS-20230724-001",
    "status": "processing",
    "updatedAt": "2023-07-25T15:45:30.000Z",
    // Dữ liệu đơn hàng khác...
  }
}
```

#### Phản hồi lỗi

**Điều kiện**: Nếu request không hợp lệ.

**Code**: `400 BAD REQUEST`

**Ví dụ nội dung**:

```json
{
  "success": false,
  "message": "Invalid status",
  "errors": ["Status must be one of: pending, processing, shipped, delivered, cancelled"]
}
```

### 4. Hủy đơn hàng (Xóa mềm)

Hủy đơn hàng bằng cách đặt trạng thái thành 'cancelled'.

**URL**: `/api/orders/:order_id`

**Method**: `DELETE`

**Tham số URL**:

- `order_id`: ID hoặc số đơn hàng

#### Phản hồi thành công

**Code**: `200 OK`

**Ví dụ nội dung**:

```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

#### Phản hồi lỗi

**Điều kiện**: Nếu không tìm thấy đơn hàng.

**Code**: `404 NOT FOUND`

**Ví dụ nội dung**:

```json
{
  "success": false,
  "message": "Order not found",
  "errors": ["No order with ID or order number: 60d21b4667d0d8992e610c85"]
}
```

### 5. Lấy đơn hàng theo email khách hàng

Lấy tất cả đơn hàng của một khách hàng dựa trên email.

**URL**: `/api/orders/by-customer/:customer_email`

**Method**: `GET`

**Tham số URL**:

- `customer_email`: Địa chỉ email của khách hàng

**Tham số Query**:

- `page` (không bắt buộc): Số trang (mặc định: 1)
- `limit` (không bắt buộc): Số item mỗi trang (mặc định: 10, tối đa: 100)
- `status` (không bắt buộc): Lọc theo trạng thái đơn hàng ('pending', 'processing', 'shipped', 'delivered', 'cancelled')

#### Phản hồi thành công

**Code**: `200 OK`

**Ví dụ nội dung**: Cùng định dạng với API Danh sách đơn hàng

### 6. Lấy đơn hàng theo số điện thoại khách hàng

Lấy tất cả đơn hàng của một khách hàng dựa trên số điện thoại.

**URL**: `/api/orders/by-phone/:customer_phone`

**Method**: `GET`

**Tham số URL**:

- `customer_phone`: Số điện thoại của khách hàng

**Tham số Query**:

- `page` (không bắt buộc): Số trang (mặc định: 1)
- `limit` (không bắt buộc): Số item mỗi trang (mặc định: 10, tối đa: 100)
- `status` (không bắt buộc): Lọc theo trạng thái đơn hàng ('pending', 'processing', 'shipped', 'delivered', 'cancelled')

#### Phản hồi thành công

**Code**: `200 OK`

**Ví dụ nội dung**: Cùng định dạng với API Danh sách đơn hàng

### 7. Thống kê đơn hàng

Lấy thống kê tổng quan về đơn hàng.

**URL**: `/api/orders/statistics`

**Method**: `GET`

#### Phản hồi thành công

**Code**: `200 OK`

**Ví dụ nội dung**:

```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "data": {
    "total_orders": 150,
    "orders_by_status": {
      "pending": 25,
      "processing": 35,
      "shipped": 40,
      "delivered": 45,
      "cancelled": 5
    },
    "total_sales": 1275000000,
    "recent_orders": 30
  }
}
```

## Lưu ý

1. API tự động đặt số lượng thành 1 nếu số lượng không hợp lệ (âm hoặc bằng 0).
2. Cách tính giá cuối cùng bao gồm:
   - Giá cơ bản của sản phẩm (từ trường product.price)
   - Giá variant (chi phí bổ sung cho variant cụ thể)
   - Điều chỉnh giá màu sắc (chi phí bổ sung cho màu cụ thể)
   - Giảm giá từ cả variant và màu sắc
3. Tất cả thông tin sản phẩm cần thiết cho đơn hàng được lưu trữ cùng với đơn hàng tại thời điểm tạo, bao gồm:
   - Chi tiết sản phẩm
   - Thông số kỹ thuật của variant
   - Thông tin màu sắc
   - Chi tiết giá cả
4. Phí vận chuyển hiện được đặt miễn phí (0 VNĐ) cho tất cả đơn hàng.
5. Khi không tìm thấy variant hoặc màu, hệ thống sẽ tự động sử dụng mục đầu tiên có sẵn và đưa ra cảnh báo trong phản hồi.
6. Đơn hàng có thể được tìm kiếm bằng cả MongoDB ObjectId hoặc số đơn hàng duy nhất (định dạng TS-YYYYMMDD-XXX).
7. Hủy đơn hàng được thực hiện dưới dạng xóa mềm (thay đổi trạng thái thành 'cancelled') thay vì xóa bản ghi khỏi cơ sở dữ liệu. 