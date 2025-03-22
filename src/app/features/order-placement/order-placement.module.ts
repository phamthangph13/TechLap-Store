import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderPlacementRoutingModule } from './order-placement-routing.module';
import { OrderPlacementListComponent } from './order-placement-list/order-placement-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    OrderPlacementRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    OrderPlacementListComponent
  ]
})
export class OrderPlacementModule { }
