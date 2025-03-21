import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminSidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fa-tachometer-alt', route: '/admin/dashboard' },
    { label: 'Quản lý đặt hàng', icon: 'fa-shopping-cart', route: '/admin/order-placement' },
    { label: 'Quản lý đơn hàng', icon: 'fa-clipboard-list', route: '/admin/order-management' },
    { label: 'Quản lý danh mục sản phẩm', icon: 'fa-folder', route: '/admin/category-management' },
    { label: 'Quản lý sản phẩm', icon: 'fa-box', route: '/admin/product-management' },
    { label: 'Báo cáo thống kê doanh thu', icon: 'fa-chart-line', route: '/admin/revenue-report' },
    { label: 'Báo cáo thống kê sản phẩm', icon: 'fa-chart-bar', route: '/admin/product-report' },
  ];
}
