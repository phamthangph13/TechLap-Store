import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RevenueReportRoutingModule } from './revenue-report-routing.module';
import { RevenueDashboardComponent } from './revenue-dashboard/revenue-dashboard.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RevenueReportRoutingModule,
    RevenueDashboardComponent
  ]
})
export class RevenueReportModule { }
