import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-footer',
  templateUrl: './admin-footer.component.html',
  styleUrls: ['./admin-footer.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AdminFooterComponent {
  currentYear = new Date().getFullYear();
}
