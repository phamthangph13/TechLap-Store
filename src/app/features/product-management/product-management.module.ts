import { NgModule } from '@angular/core';
import { ProductManagementRoutingModule } from './product-management-routing.module';
import { ProductSearchService } from './services/product-search.service';

@NgModule({
  imports: [
    ProductManagementRoutingModule
  ],
  providers: [ProductSearchService]
})
export class ProductManagementModule { } 