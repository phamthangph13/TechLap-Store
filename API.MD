# Product API Documentation

This document outlines all the available API endpoints for product management.

## 1. Create Product

### Endpoint Information

**URL**: `/api/products`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Product name (e.g., "Laptop Dell XPS 15") |
| `brand` | String | Brand name (e.g., "Dell") |
| `model` | String | Model number (e.g., "XPS 15 9530") |
| `price` | Integer | Original price in currency units (e.g., 35000000) |
| `discount_percent` | Integer | Discount percentage, 0-100 (e.g., 10) |
| `specs.cpu` | String | CPU model (e.g., "Intel Core i7-13700H") |
| `specs.ram` | String | RAM configuration (e.g., "16GB DDR5") |
| `specs.storage` | String | Storage configuration (e.g., "512GB NVMe SSD") |
| `specs.display` | String | Display specifications (e.g., "15.6 inch 4K OLED") |
| `specs.gpu` | String | GPU model (e.g., "NVIDIA RTX 4060 6GB") |
| `specs.battery` | String | Battery capacity (e.g., "86Wh") |
| `specs.os` | String | Operating system (e.g., "Windows 11 Pro") |
| `specs.ports` | Array | List of ports (e.g., ["USB-C", "HDMI", "3.5mm Audio"]) |
| `stock_quantity` | Integer | Available stock quantity (e.g., 50) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `category_ids` | Array | IDs of categories this product belongs to (can be empty or have multiple values) |
| `thumbnail` | File | Thumbnail image file (single file) |
| `images` | Files | Product image files (multiple files allowed) |
| `videos` | Files | Product video files (multiple files allowed) |
| `status` | String | Product status - available, sold_out, or discontinued (default: "available") |

### Response

**Success Response (201 Created)**:

```json
{
  "_id": "6600a1c3b6f4a2d4e8f3b123",
  "name": "Laptop Dell XPS 15",
  "brand": "Dell",
  "model": "XPS 15 9530",
  "price": 35000000,
  "discount_percent": 10,
  "discount_price": 31500000,
  "specs": {
    "cpu": "Intel Core i7-13700H",
    "ram": "16GB DDR5",
    "storage": "512GB NVMe SSD",
    "display": "15.6 inch 4K OLED",
    "gpu": "NVIDIA RTX 4060 6GB",
    "battery": "86Wh",
    "os": "Windows 11 Pro",
    "ports": ["USB-C", "HDMI", "3.5mm Audio", "SD Card Reader"]
  },
  "stock_quantity": 50,
  "category_ids": [
    "6600a1c3b6f4a2d4e8f3b130",
    "6600a1c3b6f4a2d4e8f3b131"
  ],
  "thumbnail": "6600a1c3b6f4a2d4e8f3b124",
  "images": [
    "6600a1c3b6f4a2d4e8f3b125",
    "6600a1c3b6f4a2d4e8f3b126"
  ],
  "videos": [
    "6600a1c3b6f4a2d4e8f3b128"
  ],
  "created_at": "2025-03-21T12:00:00Z",
  "updated_at": "2025-03-21T12:00:00Z",
  "status": "available"
}
```

**Error Responses**:

- **400 Bad Request**: Validation error
```json
{
  "message": "Validation error",
  "errors": {
    "name": ["Field is required."],
    "specs.cpu": ["Field is required."]
  }
}
```

- **400 Bad Request**: Invalid category ID
```json
{
  "message": "Invalid category ID format: abc123"
}
```

- **400 Bad Request**: Category not found
```json
{
  "message": "Category with ID 6600a1c3b6f4a2d4e8f3b999 not found"
}
```

- **500 Internal Server Error**: Server-side error
```json
{
  "message": "Error creating product: [error details]"
}
```

### Example Usage

```bash
curl -X POST http://localhost:5000/api/products \
  -F "name=Laptop Dell XPS 15" \
  -F "brand=Dell" \
  -F "model=XPS 15 9530" \
  -F "price=35000000" \
  -F "discount_percent=10" \
  -F "specs.cpu=Intel Core i7-13700H" \
  -F "specs.ram=16GB DDR5" \
  -F "specs.storage=512GB NVMe SSD" \
  -F "specs.display=15.6 inch 4K OLED" \
  -F "specs.gpu=NVIDIA RTX 4060 6GB" \
  -F "specs.battery=86Wh" \
  -F "specs.os=Windows 11 Pro" \
  -F "specs.ports=USB-C" \
  -F "specs.ports=HDMI" \
  -F "specs.ports=3.5mm Audio" \
  -F "stock_quantity=50" \
  -F "category_ids=6600a1c3b6f4a2d4e8f3b130" \
  -F "category_ids=6600a1c3b6f4a2d4e8f3b131" \
  -F "thumbnail=@thumbnail.jpg" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "videos=@video1.mp4"
```

## 2. Get All Products

### Endpoint Information

**URL**: `/api/products`  
**Method**: `GET`  

### Response

**Success Response (200 OK)**:

```json
[
  {
    "_id": "6600a1c3b6f4a2d4e8f3b123",
    "name": "Laptop Dell XPS 15",
    "brand": "Dell",
    "model": "XPS 15 9530",
    "price": 35000000,
    "discount_percent": 10,
    "discount_price": 31500000,
    "specs": {
      "cpu": "Intel Core i7-13700H",
      "ram": "16GB DDR5",
      "storage": "512GB NVMe SSD",
      "display": "15.6 inch 4K OLED",
      "gpu": "NVIDIA RTX 4060 6GB",
      "battery": "86Wh",
      "os": "Windows 11 Pro",
      "ports": ["USB-C", "HDMI", "3.5mm Audio", "SD Card Reader"]
    },
    "stock_quantity": 50,
    "category_ids": ["6600a1c3b6f4a2d4e8f3b130", "6600a1c3b6f4a2d4e8f3b131"],
    "thumbnail": "6600a1c3b6f4a2d4e8f3b124",
    "images": ["6600a1c3b6f4a2d4e8f3b125", "6600a1c3b6f4a2d4e8f3b126"],
    "videos": ["6600a1c3b6f4a2d4e8f3b128"],
    "created_at": "2025-03-21T12:00:00Z",
    "updated_at": "2025-03-21T12:00:00Z",
    "status": "available"
  },
  // more products...
]
```

**Error Response**:

- **500 Internal Server Error**: Server-side error

### Example Usage

```bash
curl -X GET http://localhost:5000/api/products
```

## 3. Get Product by ID

### Endpoint Information

**URL**: `/api/products/{id}`  
**Method**: `GET`  

### Parameters

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `id` | Path | Yes | Product ID |

### Response

**Success Response (200 OK)**:

```json
{
  "_id": "6600a1c3b6f4a2d4e8f3b123",
  "name": "Laptop Dell XPS 15",
  "brand": "Dell",
  "model": "XPS 15 9530",
  "price": 35000000,
  "discount_percent": 10,
  "discount_price": 31500000,
  "specs": {
    "cpu": "Intel Core i7-13700H",
    "ram": "16GB DDR5",
    "storage": "512GB NVMe SSD",
    "display": "15.6 inch 4K OLED",
    "gpu": "NVIDIA RTX 4060 6GB",
    "battery": "86Wh",
    "os": "Windows 11 Pro",
    "ports": ["USB-C", "HDMI", "3.5mm Audio", "SD Card Reader"]
  },
  "stock_quantity": 50,
  "category_ids": ["6600a1c3b6f4a2d4e8f3b130", "6600a1c3b6f4a2d4e8f3b131"],
  "thumbnail": "6600a1c3b6f4a2d4e8f3b124",
  "images": ["6600a1c3b6f4a2d4e8f3b125", "6600a1c3b6f4a2d4e8f3b126"],
  "videos": ["6600a1c3b6f4a2d4e8f3b128"],
  "created_at": "2025-03-21T12:00:00Z",
  "updated_at": "2025-03-21T12:00:00Z",
  "status": "available"
}
```

**Error Responses**:

- **400 Bad Request**: Invalid ID format
```json
{
  "message": "Invalid product ID format: invalid-id"
}
```

- **404 Not Found**: Product not found
```json
{
  "message": "Product with ID 6600a1c3b6f4a2d4e8f3b999 not found"
}
```

- **500 Internal Server Error**: Server-side error
```json
{
  "message": "Error retrieving product: [error details]"
}
```

### Example Usage

```bash
curl -X GET http://localhost:5000/api/products/6600a1c3b6f4a2d4e8f3b123
```

## 4. Update Product

### Endpoint Information

**URL**: `/api/products/{id}`  
**Method**: `PUT`  
**Content-Type**: `multipart/form-data`

### Parameters

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `id` | Path | Yes | Product ID |

### Optional Fields

All fields that are required when creating a product are optional when updating. Only fields that you want to change need to be included in the request.

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Product name |
| `brand` | String | Brand name |
| `model` | String | Model number |
| `price` | Integer | Original price in currency units |
| `discount_percent` | Integer | Discount percentage, 0-100 |
| `specs.cpu` | String | CPU model |
| `specs.ram` | String | RAM configuration |
| `specs.storage` | String | Storage configuration |
| `specs.display` | String | Display specifications |
| `specs.gpu` | String | GPU model |
| `specs.battery` | String | Battery capacity |
| `specs.os` | String | Operating system |
| `specs.ports` | Array | List of ports |
| `stock_quantity` | Integer | Available stock quantity |
| `category_ids` | Array | IDs of categories (can be empty or have multiple values) |
| `thumbnail` | File | Thumbnail image file (single file) |
| `images` | Files | Product image files (multiple files allowed) |
| `videos` | Files | Product video files (multiple files allowed) |
| `status` | String | Product status - available, sold_out, or discontinued |

### Response

**Success Response (200 OK)**:

```json
{
  "_id": "6600a1c3b6f4a2d4e8f3b123",
  "name": "Laptop Dell XPS 15 (Updated)",
  "brand": "Dell",
  "model": "XPS 15 9530",
  "price": 34000000,
  "discount_percent": 15,
  "discount_price": 28900000,
  "specs": {
    "cpu": "Intel Core i7-13700H",
    "ram": "32GB DDR5",
    "storage": "1TB NVMe SSD",
    "display": "15.6 inch 4K OLED",
    "gpu": "NVIDIA RTX 4060 6GB",
    "battery": "86Wh",
    "os": "Windows 11 Pro",
    "ports": ["USB-C", "HDMI", "3.5mm Audio", "SD Card Reader"]
  },
  "stock_quantity": 45,
  "category_ids": ["6600a1c3b6f4a2d4e8f3b130"],
  "thumbnail": "6600a1c3b6f4a2d4e8f3b124",
  "images": ["6600a1c3b6f4a2d4e8f3b125", "6600a1c3b6f4a2d4e8f3b126"],
  "videos": ["6600a1c3b6f4a2d4e8f3b128"],
  "created_at": "2025-03-21T12:00:00Z",
  "updated_at": "2025-03-22T10:00:00Z",
  "status": "available"
}
```

**Error Responses**:

- **400 Bad Request**: Invalid ID format
```json
{
  "message": "Invalid product ID format: invalid-id"
}
```

- **400 Bad Request**: Invalid category ID
```json
{
  "message": "Invalid category ID format: abc123"
}
```

- **400 Bad Request**: Category not found
```json
{
  "message": "Category with ID 6600a1c3b6f4a2d4e8f3b999 not found"
}
```

- **404 Not Found**: Product not found
```json
{
  "message": "Product with ID 6600a1c3b6f4a2d4e8f3b999 not found"
}
```

- **500 Internal Server Error**: Server-side error
```json
{
  "message": "Error updating product: [error details]"
}
```

### Example Usage

```bash
curl -X PUT http://localhost:5000/api/products/6600a1c3b6f4a2d4e8f3b123 \
  -F "name=Laptop Dell XPS 15 (Updated)" \
  -F "price=34000000" \
  -F "discount_percent=15" \
  -F "specs.ram=32GB DDR5" \
  -F "specs.storage=1TB NVMe SSD" \
  -F "stock_quantity=45" \
  -F "category_ids=6600a1c3b6f4a2d4e8f3b130"
```

## 5. Delete Product

### Endpoint Information

**URL**: `/api/products/{id}`  
**Method**: `DELETE`  

### Parameters

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `id` | Path | Yes | Product ID |

### Response

**Success Response (204 No Content)**:
No content is returned on successful deletion.

**Error Responses**:

- **400 Bad Request**: Invalid ID format
```json
{
  "message": "Invalid product ID format: invalid-id"
}
```

- **404 Not Found**: Product not found
```json
{
  "message": "Product with ID 6600a1c3b6f4a2d4e8f3b999 not found"
}
```

- **500 Internal Server Error**: Server-side error
```json
{
  "message": "Error deleting product: [error details]"
}
```

### Example Usage

```bash
curl -X DELETE http://localhost:5000/api/products/6600a1c3b6f4a2d4e8f3b123
```

## 6. Get Product File

### Endpoint Information

**URL**: `/api/products/files/{file_id}`  
**Method**: `GET`  

### Parameters

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `file_id` | Path | Yes | File ID (from thumbnail, images, or videos) |

### Response

**Success Response (200 OK)**:
The file content with appropriate content type headers.

**Error Responses**:

- **400 Bad Request**: Invalid file ID format
```json
{
  "message": "Invalid file ID format: invalid-id"
}
```

- **404 Not Found**: File not found
```json
{
  "message": "File with ID 6600a1c3b6f4a2d4e8f3b999 not found"
}
```

### Example Usage

```bash
curl -X GET http://localhost:5000/api/products/files/6600a1c3b6f4a2d4e8f3b124 --output thumbnail.jpg
```

## Notes

- File uploads (thumbnail, images, videos) are stored in MongoDB GridFS
- The discount_price is automatically calculated from price and discount_percent
- The created_at and updated_at timestamps are automatically generated
- When providing array fields like specs.ports or category_ids, repeat the field name for each value
- Products can have multiple categories or no categories at all
- When updating a product, only include the fields you want to change
- For file uploads in PUT requests, the existing files will be replaced with the new ones
- Deleting a product will also delete all associated files (thumbnail, images, videos) 



Theo tài liệu API:

1. **Lưu trữ**: Tất cả các file (thumbnail, images, videos) được lưu trong MongoDB GridFS.

2. **Upload**: File được tải lên thông qua API dưới dạng multipart/form-data:
   - `thumbnail`: 1 file ảnh đại diện
   - `images`: nhiều file ảnh sản phẩm
   - `videos`: nhiều file video sản phẩm

3. **Phản hồi API**: Sau khi tải lên, API trả về ID của các file đã lưu trữ:
   ```json
   {
     "thumbnail": "6600a1c3b6f4a2d4e8f3b124",
     "images": ["6600a1c3b6f4a2d4e8f3b125", "6600a1c3b6f4a2d4e8f3b126"],
     "videos": ["6600a1c3b6f4a2d4e8f3b128"]
   }
   ```

4. **Hiển thị**: Để hiển thị file, sử dụng endpoint riêng:
   - URL: `/api/products/files/{file_id}`
   - Phương thức: GET
   - Ví dụ: `GET /api/products/files/6600a1c3b6f4a2d4e8f3b124` để lấy thumbnail
   - API trả về nội dung file với header Content-Type phù hợp
