import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RevenueDashboardComponent } from './revenue-dashboard/revenue-dashboard.component';

const routes: Routes = [
  { path: '', component: RevenueDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RevenueReportRoutingModule { }
