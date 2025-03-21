import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderManagementRoutingModule } from './order-management-routing.module';
import { OrderListComponent } from './order-list/order-list.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OrderManagementRoutingModule,
    OrderListComponent
  ]
})
export class OrderManagementModule { }
