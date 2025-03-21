import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-placement-list',
  templateUrl: './order-placement-list.component.html',
  styleUrls: ['./order-placement-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class OrderPlacementListComponent implements OnInit {
  orderForm!: FormGroup;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.createForm();
  }
  
  createForm(): void {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      customerPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerAddress: ['', Validators.required],
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }
  
  onSubmit(): void {
    if (this.orderForm.invalid) {
      return;
    }
    
    console.log('Order placed:', this.orderForm.value);
    
    // Here you would typically call a service to save the order
    
    // Reset form after submission
    this.orderForm.reset();
    this.orderForm.patchValue({
      quantity: 1
    });
  }
}
