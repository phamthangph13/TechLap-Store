# Product Statistics API Documentation

This document provides details on the Product Statistics API endpoints that allow you to retrieve statistical and analytical data about products, sales, and inventory status.

## Base URL

```
/api/product-statistics
```

## Available Endpoints

- [Get Top Selling Products](#get-top-selling-products)
- [Get Product Statistics by Category](#get-product-statistics-by-category)
- [Get Inventory Status](#get-inventory-status)
- [Get Product Sales Trends](#get-product-sales-trends)

## Common Parameters

Many endpoints accept the following query parameters for time period selection:

| Parameter   | Type   | Description                                                     | Default    |
|-------------|--------|-----------------------------------------------------------------|------------|
| period      | string | Time period for statistics (`daily`, `weekly`, `monthly`, `yearly`, `custom`) | `monthly` |
| start_date  | string | Start date for custom period (format: YYYY-MM-DD)              | -          |
| end_date    | string | End date for custom period (format: YYYY-MM-DD)                | -          |
| year        | int    | Year for yearly or monthly statistics                          | current year |
| month       | int    | Month for monthly statistics                                   | current month |
| limit       | int    | Limit number of results                                        | 10         |
| category_id | string | Filter results by category ID                                  | -          |

---

## Get Top Selling Products

Returns the top selling products based on sales quantity for the specified time period.

### Request

```
GET /api/product-statistics/top-selling
```

### Query Parameters

All [common parameters](#common-parameters) are supported.

### Response

```json
{
  "success": true,
  "message": "Top selling products for monthly period",
  "data": [
    {
      "product_id": "60d21b4667d0d8992e610c85",
      "name": "iPhone 13 Pro",
      "brand": "Apple",
      "total_sales": 45,
      "total_revenue": 44955.00,
      "current_stock": 22
    },
    {
      "product_id": "60d21b4667d0d8992e610c86",
      "name": "Samsung Galaxy S21",
      "brand": "Samsung",
      "total_sales": 38,
      "total_revenue": 30400.00,
      "current_stock": 15
    }
  ]
}
```

---

## Get Product Statistics by Category

Returns product sales statistics grouped by product categories.

### Request

```
GET /api/product-statistics/by-category
```

### Query Parameters

All [common parameters](#common-parameters) are supported.

### Response

```json
{
  "success": true,
  "message": "Product statistics by category for monthly period",
  "data": [
    {
      "category_id": "60d21b4667d0d8992e610c70",
      "name": "Smartphones",
      "total_products": 15,
      "total_sales": 120,
      "total_revenue": 95600.00
    },
    {
      "category_id": "60d21b4667d0d8992e610c71",
      "name": "Laptops",
      "total_products": 8,
      "total_sales": 45,
      "total_revenue": 67500.00
    }
  ]
}
```

---

## Get Inventory Status

Returns current inventory status including overall statistics and lists of products with low stock or out of stock.

### Request

```
GET /api/product-statistics/inventory-status
```

### Response

```json
{
  "success": true,
  "message": "Current inventory status",
  "data": {
    "summary": {
      "total_products": 45,
      "total_value": 225000.00,
      "low_stock_count": 5,
      "out_of_stock_count": 3,
      "in_stock_count": 42
    },
    "low_stock_products": [
      {
        "product_id": "60d21b4667d0d8992e610c85",
        "name": "iPhone 13 Pro",
        "brand": "Apple",
        "current_stock": 3,
        "status": "available"
      }
    ],
    "out_of_stock_products": [
      {
        "product_id": "60d21b4667d0d8992e610c90",
        "name": "Google Pixel 6",
        "brand": "Google",
        "current_stock": 0,
        "status": "out_of_stock"
      }
    ]
  }
}
```

---

## Get Product Sales Trends

Returns product sales trends over time, allowing for analysis of sales patterns.

### Request

```
GET /api/product-statistics/sales-trends
```

### Query Parameters

All [common parameters](#common-parameters) are supported.

### Response

```json
{
  "success": true,
  "message": "Product sales trends for monthly period",
  "data": [
    {
      "period": "2023-01",
      "products": [
        {
          "product_id": "60d21b4667d0d8992e610c85",
          "name": "iPhone 13 Pro",
          "quantity": 12,
          "revenue": 11988.00
        },
        {
          "product_id": "60d21b4667d0d8992e610c86",
          "name": "Samsung Galaxy S21",
          "quantity": 8,
          "revenue": 6400.00
        }
      ]
    },
    {
      "period": "2023-02",
      "products": [
        {
          "product_id": "60d21b4667d0d8992e610c85",
          "name": "iPhone 13 Pro",
          "quantity": 15,
          "revenue": 14985.00
        },
        {
          "product_id": "60d21b4667d0d8992e610c86",
          "name": "Samsung Galaxy S21",
          "quantity": 10,
          "revenue": 8000.00
        }
      ]
    }
  ]
}
```

## Implementation Guidelines

### Setup

1. Import the product statistics namespace in your app.py:
   ```python
   from routes.product_statistics_routes import product_statistics_ns
   ```

2. Register the namespace:
   ```python
   api.add_namespace(product_statistics_ns, path="/api/product-statistics")
   ```

### Database Aggregation

The product statistics API makes heavy use of MongoDB aggregation pipelines for efficient data processing:

#### Example: Top Selling Products Aggregation

```python
pipeline = [
    {'$match': {'order_date': {'$gte': start_date, '$lte': end_date}}},
    {'$unwind': '$items'},
    {'$group': {
        '_id': '$items.product_id',
        'total_quantity': {'$sum': '$items.quantity'},
        'total_revenue': {'$sum': {'$multiply': ['$items.quantity', '$items.price']}}
    }},
    {'$sort': {'total_quantity': -1}},
    {'$limit': limit}
]
```

### Time Period Handling

The API provides flexible time period selection with the `get_date_range()` helper function that handles:
- Daily statistics (current day)
- Weekly statistics (current week)
- Monthly statistics (specified month/year or current month)
- Yearly statistics (specified year or current year)
- Custom date range (specified start and end dates)

### Response Format

All endpoints follow a consistent response format:
```json
{
  "success": true|false,
  "message": "Description of the response",
  "data": [Result data...]
}
```

### Error Handling

Invalid date formats or parameters will default to sensible values rather than returning errors:
- Invalid custom date range defaults to last 30 days
- Missing year/month defaults to current year/month

### Performance Considerations

- Use projection in MongoDB queries to limit the fields returned
- Aggregate data in the database rather than in application code
- For heavy reporting, consider implementing caching strategies
- Use pagination with the `limit` parameter for large result sets 