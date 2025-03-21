import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CategoryManagementRoutingModule } from './category-management-routing.module';
import { CategoryListComponent } from './category-list/category-list.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CategoryManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CategoryListComponent
  ]
})
export class CategoryManagementModule { }
