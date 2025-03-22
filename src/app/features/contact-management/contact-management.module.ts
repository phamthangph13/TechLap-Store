import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactManagementRoutingModule } from './contact-management-routing.module';
import { ContactListComponent } from './contact-list/contact-list.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ContactManagementRoutingModule,
    ContactListComponent
  ]
})
export class ContactManagementModule { } 