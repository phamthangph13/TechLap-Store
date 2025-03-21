# Hướng dẫn sử dụng các component hiển thị media

## 1. Import các components

Trong file TypeScript của component sản phẩm, import các components media:

```typescript
import { 
  ProductImageComponent, 
  ProductVideoComponent, 
  ProductGalleryComponent, 
  ProductMediaPlayerComponent 
} from 'src/app/shared/components/media';
```

Thêm vào mảng imports của component:

```typescript
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    // ... other imports
    ProductImageComponent,
    ProductVideoComponent,
    ProductGalleryComponent,
    ProductMediaPlayerComponent
  ],
  // ...
})
```

## 2. Hiển thị hình ảnh đơn (thumbnail hoặc một ảnh)

```html
<!-- Hiển thị thumbnail -->
<app-product-image 
  [fileId]="product.thumbnailId"
  alt="Thumbnail của sản phẩm"
  width="200px"
  height="200px"
></app-product-image>
```

## 3. Hiển thị video

```html
<!-- Hiển thị video -->
<app-product-video 
  [fileId]="videoId"
  [posterUrl]="thumbnailUrl"
></app-product-video>
```

## 4. Hiển thị gallery hình ảnh

```html
<!-- Hiển thị gallery hình ảnh -->
<app-product-gallery
  [thumbnailId]="product.thumbnailId"
  [imageIds]="product.imageIds"
  [alt]="product.name + ' gallery'"
></app-product-gallery>
```

## 5. Hiển thị trình phát media đầy đủ (cả ảnh và video)

```html
<!-- Hiển thị trình phát media đầy đủ -->
<app-product-media-player
  [thumbnailId]="product.thumbnailId"
  [imageIds]="product.imageIds"
  [videoIds]="product.videoIds"
  [productName]="product.name"
></app-product-media-player>
```

## 6. Xử lý dữ liệu từ API

Khi nhận dữ liệu sản phẩm từ API, sản phẩm sẽ có các trường:

```typescript
interface Product {
  _id: string;
  name: string;
  // ... other product fields
  thumbnailId: string;
  imageIds: string[];
  videoIds: string[];
}
```

Các components sẽ tự động xử lý việc tải các file media từ API sử dụng `MediaService`. 