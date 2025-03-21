import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGalleryComponent } from './product-gallery.component';
import { ProductVideoComponent } from './product-video.component';

@Component({
  selector: 'app-product-media-player',
  standalone: true,
  imports: [CommonModule, ProductGalleryComponent, ProductVideoComponent],
  template: `
    <div class="media-player-container" [class]="cssClass">
      <!-- Tab navigation -->
      <div class="media-tabs">
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'images'"
          (click)="activeTab = 'images'"
        >
          Hình ảnh ({{hasImages ? imageIds.length : 0}})
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'videos'"
          (click)="activeTab = 'videos'"
          [disabled]="!hasVideos"
        >
          Video ({{hasVideos ? videoIds.length : 0}})
        </button>
      </div>
      
      <!-- Content panels -->
      <div class="tab-content">
        <!-- Images panel -->
        <div *ngIf="activeTab === 'images'" class="panel">
          <app-product-gallery
            [thumbnailId]="thumbnailId" 
            [imageIds]="imageIds"
            [alt]="productName + ' gallery'"
          ></app-product-gallery>
        </div>
        
        <!-- Videos panel -->
        <div *ngIf="activeTab === 'videos'" class="panel">
          <div class="videos-container">
            <div *ngFor="let videoId of videoIds" class="video-item">
              <app-product-video 
                [fileId]="videoId"
                [posterUrl]="thumbnailUrl"
              ></app-product-video>
            </div>
            <div *ngIf="!hasVideos" class="no-videos">
              <p>Sản phẩm này không có video</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .media-player-container {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .media-tabs {
      display: flex;
      border-bottom: 1px solid #e1e1e1;
    }
    
    .tab-button {
      padding: 12px 24px;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 500;
      color: #666;
      transition: all 0.2s ease;
      border-bottom: 2px solid transparent;
    }
    
    .tab-button.active {
      color: #4a90e2;
      border-bottom: 2px solid #4a90e2;
    }
    
    .tab-button:disabled {
      color: #ccc;
      cursor: not-allowed;
    }
    
    .tab-content {
      padding: 16px;
    }
    
    .panel {
      min-height: 200px;
    }
    
    .videos-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .video-item {
      width: 100%;
    }
    
    .no-videos {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      background-color: #f9f9f9;
      border-radius: 8px;
      color: #666;
    }
  `]
})
export class ProductMediaPlayerComponent implements OnInit {
  @Input() thumbnailId: string = '';
  @Input() imageIds: string[] = [];
  @Input() videoIds: string[] = [];
  @Input() productName: string = 'Product';
  @Input() cssClass: string = '';
  
  activeTab: 'images' | 'videos' = 'images';
  thumbnailUrl: string = '';
  
  get hasImages(): boolean {
    return this.imageIds && this.imageIds.length > 0;
  }
  
  get hasVideos(): boolean {
    return this.videoIds && this.videoIds.length > 0;
  }
  
  ngOnInit(): void {
    // Default to videos tab if only videos exist
    if (!this.hasImages && this.hasVideos) {
      this.activeTab = 'videos';
    }
  }
} 