import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../../services/media.service';

@Component({
  selector: 'app-product-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img 
      [src]="imageUrl || placeholderUrl" 
      [alt]="alt"
      [class]="cssClass"
      (error)="onImageError()"
      [style.width]="width"
      [style.height]="height"
    />
  `,
  styles: [`
    :host {
      display: block;
    }
    img {
      object-fit: cover;
    }
  `]
})
export class ProductImageComponent implements OnInit, OnDestroy, OnChanges {
  @Input() fileId: string = '';
  @Input() alt: string = 'Product image';
  @Input() cssClass: string = '';
  @Input() width: string = 'auto';
  @Input() height: string = 'auto';
  @Input() placeholderUrl: string = 'assets/images/placeholder.jpg';

  imageUrl: string | null = null;

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.loadImage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileId']) {
      this.cleanupExistingUrl();
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    this.cleanupExistingUrl();
  }

  private loadImage(): void {
    if (!this.fileId) {
      return;
    }

    this.mediaService.getFile(this.fileId).subscribe(blob => {
      if (blob.size > 0) {
        this.imageUrl = this.mediaService.createObjectUrl(blob);
      } else {
        this.imageUrl = null;
      }
    });
  }

  private cleanupExistingUrl(): void {
    if (this.imageUrl) {
      this.mediaService.revokeObjectUrl(this.imageUrl);
      this.imageUrl = null;
    }
  }

  onImageError(): void {
    this.imageUrl = this.placeholderUrl;
  }
} 