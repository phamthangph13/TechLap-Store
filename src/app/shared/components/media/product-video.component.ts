import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../../services/media.service';

@Component({
  selector: 'app-product-video',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-container" [class]="cssClass">
      <video 
        *ngIf="videoUrl; else noVideo"
        [src]="videoUrl"
        controls
        [poster]="posterUrl"
        (error)="onVideoError()"
        [width]="width"
        [height]="height"
      ></video>
      
      <ng-template #noVideo>
        <div class="video-placeholder">
          <p>Video không khả dụng</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .video-container {
      width: 100%;
      position: relative;
    }
    video {
      width: 100%;
      display: block;
    }
    .video-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f1f1f1;
      min-height: 150px;
      color: #666;
    }
  `]
})
export class ProductVideoComponent implements OnInit, OnDestroy, OnChanges {
  @Input() fileId: string = '';
  @Input() posterUrl: string = '';  // Optional thumbnail to show before video plays
  @Input() cssClass: string = '';
  @Input() width: string = '100%';
  @Input() height: string = 'auto';

  videoUrl: string | null = null;

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.loadVideo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileId']) {
      this.cleanupExistingUrl();
      this.loadVideo();
    }
  }

  ngOnDestroy(): void {
    this.cleanupExistingUrl();
  }

  private loadVideo(): void {
    if (!this.fileId) {
      return;
    }

    this.mediaService.getFile(this.fileId).subscribe(blob => {
      if (blob.size > 0) {
        this.videoUrl = this.mediaService.createObjectUrl(blob);
      } else {
        this.videoUrl = null;
      }
    });
  }

  private cleanupExistingUrl(): void {
    if (this.videoUrl) {
      this.mediaService.revokeObjectUrl(this.videoUrl);
      this.videoUrl = null;
    }
  }

  onVideoError(): void {
    this.videoUrl = null;
  }
} 