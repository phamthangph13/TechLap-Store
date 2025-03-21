import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderPlacementListComponent } from './order-placement-list/order-placement-list.component';

const routes: Routes = [
  { path: '', component: OrderPlacementListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderPlacementRoutingModule { }
