import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss'],
  standalone: true,
  imports: [RouterOutlet, RouterLink]
})
export class ProductManagementComponent {
  // Parent component that hosts the router outlet for sub-components
} 