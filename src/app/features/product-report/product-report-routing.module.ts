import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductReportDashboardComponent } from './product-report-dashboard/product-report-dashboard.component';

const routes: Routes = [
  { path: '', component: ProductReportDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductReportRoutingModule { }
