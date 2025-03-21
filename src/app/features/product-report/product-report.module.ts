import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductReportRoutingModule } from './product-report-routing.module';
import { ProductReportDashboardComponent } from './product-report-dashboard/product-report-dashboard.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProductReportRoutingModule,
    ProductReportDashboardComponent
  ]
})
export class ProductReportModule { }
