import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductImageComponent } from './product-image.component';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule, ProductImageComponent],
  template: `
    <div class="gallery-container" [class]="cssClass">
      <div class="main-image">
        <app-product-image 
          [fileId]="selectedImageId || thumbnailId"
          [alt]="alt"
          width="100%"
          height="auto"
        ></app-product-image>
      </div>
      
      <div class="thumbnails" *ngIf="imageIds && imageIds.length > 0">
        <div 
          *ngFor="let imageId of imageIds" 
          class="thumbnail" 
          [class.active]="imageId === selectedImageId"
          (click)="selectImage(imageId)"
        >
          <app-product-image 
            [fileId]="imageId"
            [alt]="alt"
            width="100%"
            height="100%"
          ></app-product-image>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .main-image {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .thumbnails {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s ease;
    }
    
    .thumbnail.active {
      border-color: #4a90e2;
    }
  `]
})
export class ProductGalleryComponent implements OnInit {
  @Input() thumbnailId: string = '';
  @Input() imageIds: string[] = [];
  @Input() alt: string = 'Product image';
  @Input() cssClass: string = '';
  
  selectedImageId: string | null = null;
  
  ngOnInit(): void {
    // Default to first image if available
    if (this.imageIds && this.imageIds.length > 0) {
      this.selectedImageId = this.imageIds[0];
    }
  }
  
  selectImage(imageId: string): void {
    this.selectedImageId = imageId;
  }
} 