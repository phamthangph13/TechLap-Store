# API Documentation for Revenue Reporting and Statistics

This document outlines the Revenue Reporting and Statistics APIs for Tech-Lap backend system. These APIs provide comprehensive data on revenue performance, trends, and product-specific sales metrics.

## Base URL

```
/api/revenue
```

## Authentication

Currently, these APIs do not require authentication but will be secured in future updates.

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": [] | {}
}
```

## Important Note on Revenue Calculation

All revenue metrics are calculated based on **delivered orders only**. Orders in other states (pending, processing, shipped, cancelled) are not included in revenue calculations.

## Order Data Structure

The revenue APIs rely on the following Order data structure in MongoDB:

```json
{
  "_id": ObjectId,
  "order_number": "TS-YYYYMMDD-XXX",
  "customer": {
    "fullName": "Customer Name",
    "phone": "0123456789",
    "email": "customer@example.com"
  },
  "shipping_address": {
    "province": "Province",
    "district": "District",
    "ward": "Ward",
    "streetAddress": "Street Address"
  },
  "items": [
    {
      "productId": ObjectId,
      "productName": "Product Name",
      "variantName": "Variant Name",
      "colorName": "Color Name",
      "quantity": 1,
      "unitPrice": 1000000,
      "discountedPrice": 950000,
      "subtotal": 950000
    }
  ],
  "payment": {
    "method": "COD",
    "status": "pending"
  },
  "subtotal": 950000,
  "discount_total": 50000,
  "shipping_fee": 35000,
  "total": 985000,
  "status": "delivered",
  "order_date": ISODate("2023-03-15T10:30:00Z"),
  "updated_at": ISODate("2023-03-16T14:20:00Z")
}
```

Key fields used in revenue calculations:
- `status`: Used to filter for "delivered" orders only
- `total`: Total order value including shipping fee
- `items`: Collection of products in the order
- `items.productId`: Used to group revenue by product
- `items.quantity`: Used to calculate quantity sold
- `items.subtotal`: Used to calculate revenue by product

## Available Endpoints

### 1. Get Revenue Statistics

Retrieve revenue statistics for different time periods (daily, weekly, monthly, yearly, or custom).

**Endpoint:** `GET /api/revenue/statistics`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| period | string | No | "monthly" | Time period for statistics: "daily", "weekly", "monthly", "yearly", "custom" |
| start_date | string | Only for custom | - | Start date for custom period (YYYY-MM-DD) |
| end_date | string | Only for custom | - | End date for custom period (YYYY-MM-DD) |
| year | integer | Only for yearly | current year | Year for yearly statistics |
| month | integer | Only for monthly | current month | Month for monthly statistics |

**Example Request:**

```
GET /api/revenue/statistics?period=monthly
```

**Example Response:**

```json
{
  "success": true,
  "message": "Revenue statistics for monthly period",
  "data": [
    {
      "period": "January 2023",
      "total_revenue": 25678900,
      "total_orders": 142,
      "average_order_value": 180836.62
    },
    {
      "period": "February 2023",
      "total_revenue": 31245700,
      "total_orders": 165,
      "average_order_value": 189367.88
    }
  ]
}
```

### 2. Get Revenue Summary

Provides a comprehensive summary of revenue metrics including today's revenue, monthly statistics, year-to-date figures, growth rates, and top-selling products.

**Endpoint:** `GET /api/revenue/summary`

**Example Request:**

```
GET /api/revenue/summary
```

**Example Response:**

```json
{
  "success": true,
  "message": "Revenue summary",
  "data": {
    "today": {
      "revenue": 2650000,
      "orders": 12
    },
    "this_month": {
      "revenue": 42580000,
      "orders": 187,
      "avg_order_value": 227700.53
    },
    "prev_month": {
      "revenue": 39750000,
      "orders": 176
    },
    "this_year": {
      "revenue": 325450000,
      "orders": 1432,
      "avg_order_value": 227270.25
    },
    "growth": {
      "month_over_month": 7.12,
      "month_name": "March"
    },
    "top_products": [
      {
        "productId": "60a2b8e34f5e7d2b9c8f1a3d",
        "productName": "MacBook Pro M2",
        "total_revenue": 125750000,
        "quantity_sold": 43
      },
      {
        "productId": "60a2b8e34f5e7d2b9c8f1a3e",
        "productName": "iPhone 14 Pro Max",
        "total_revenue": 98450000,
        "quantity_sold": 56
      },
      {
        "productId": "60a2b8e34f5e7d2b9c8f1a3f",
        "productName": "iPad Pro",
        "total_revenue": 45320000,
        "quantity_sold": 32
      }
    ]
  }
}
```

### 3. Get Revenue by Product

Retrieve revenue statistics broken down by product for a specific time period.

**Endpoint:** `GET /api/revenue/by-product`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| period | string | No | "monthly" | Time period for statistics: "daily", "weekly", "monthly", "yearly", "custom" |
| start_date | string | Only for custom | - | Start date for custom period (YYYY-MM-DD) |
| end_date | string | Only for custom | - | End date for custom period (YYYY-MM-DD) |
| year | integer | Only for yearly | current year | Year for yearly statistics |
| month | integer | Only for monthly | current month | Month for monthly statistics |

**Example Request:**

```
GET /api/revenue/by-product?period=monthly&year=2023&month=3
```

**Example Response:**

```json
{
  "success": true,
  "message": "Product revenue statistics for monthly period",
  "data": [
    {
      "productId": "60a2b8e34f5e7d2b9c8f1a3d",
      "productName": "MacBook Pro M2",
      "total_revenue": 42580000,
      "quantity_sold": 14,
      "avg_price": 3041428.57
    },
    {
      "productId": "60a2b8e34f5e7d2b9c8f1a3e",
      "productName": "iPhone 14 Pro Max",
      "total_revenue": 37950000,
      "quantity_sold": 21,
      "avg_price": 1807142.86
    }
  ]
}
```

## Error Responses

When errors occur, the API will return an appropriate HTTP status code and error details:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Error details"]
}
```

Common error codes:
- 400: Bad Request - Invalid parameters
- 404: Not Found - Resource not found
- 500: Server Error - Unexpected server error

## Examples of Using the API

### Example 1: Get Monthly Revenue for a Specific Year

```
GET /api/revenue/statistics?period=monthly&year=2023
```

### Example 2: Get Revenue for a Custom Date Range

```
GET /api/revenue/statistics?period=custom&start_date=2023-01-01&end_date=2023-03-31
```

### Example 3: Get Revenue by Product for the Current Month

```
GET /api/revenue/by-product?period=monthly
```

## Visualization Tips

The data from these APIs can be effectively visualized using:

1. **Line charts** for trend analysis over time periods
2. **Bar charts** for comparing revenue across products 
3. **Pie charts** for showing product revenue distribution
4. **KPI cards** for displaying summary metrics
5. **Heat maps** for showing daily/weekly sales patterns

## Future Enhancements

Planned future enhancements to the Revenue API include:

1. Advanced filtering by product categories
2. Geographical revenue breakdowns
3. Customer segment analysis
4. Forecast and predictive revenue analytics
5. Export capabilities (CSV, Excel, PDF) 