import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact, ContactResponse, ContactDetailResponse, MessageResponse } from '../../../services/contact.service';
import { finalize } from 'rxjs/operators';

// Bootstrap import workaround since the types might not be available
declare const bootstrap: any;

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit, AfterViewInit {
  contacts: Contact[] = [];
  totalContacts = 0;
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  error: string | null = null;
  
  // For modals
  viewModal: any = null;
  deleteModal: any = null;
  selectedContact: Contact | null = null;
  contactIdToDelete: string = '';
  isModalLoading = false;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap modals
    const viewModalEl = document.getElementById('viewContactModal');
    const deleteModalEl = document.getElementById('deleteConfirmModal');
    
    if (viewModalEl) {
      this.viewModal = new bootstrap.Modal(viewModalEl);
    }
    
    if (deleteModalEl) {
      this.deleteModal = new bootstrap.Modal(deleteModalEl);
    }
  }

  loadContacts(page: number = this.currentPage): void {
    this.isLoading = true;
    this.error = null;
    
    this.contactService.getContacts(page, this.pageSize)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: ContactResponse) => {
          this.contacts = response.data;
          this.totalContacts = response.pagination.total;
          this.currentPage = response.pagination.page;
        },
        error: (err: any) => {
          console.error('Error loading contacts:', err);
          this.error = 'Failed to load contacts. Please try again later.';
        }
      });
  }
  
  viewContact(id: string): void {
    this.isModalLoading = true;
    this.selectedContact = null;
    
    this.contactService.getContact(id).subscribe({
      next: (response: ContactDetailResponse) => {
        this.selectedContact = response.data;
        this.isModalLoading = false;
        this.viewModal?.show();
        
        // Refresh the list to show the updated read status
        this.loadContacts(this.currentPage);
      },
      error: (err: any) => {
        console.error('Error loading contact details:', err);
        this.isModalLoading = false;
        this.error = 'Failed to load contact details. Please try again later.';
      }
    });
  }
  
  markAsRead(id: string): void {
    this.contactService.markAsRead(id).subscribe({
      next: (response: MessageResponse) => {
        // Find and update the contact in the current list
        const contact = this.contacts.find(c => c._id === id);
        if (contact) {
          contact.status = 'read';
        }
      },
      error: (err: any) => {
        console.error('Error marking contact as read:', err);
        this.error = 'Failed to mark contact as read. Please try again later.';
      }
    });
  }
  
  confirmDelete(id: string): void {
    this.contactIdToDelete = id;
    this.deleteModal?.show();
  }
  
  deleteContact(): void {
    if (!this.contactIdToDelete) return;
    
    this.contactService.deleteContact(this.contactIdToDelete).subscribe({
      next: (response: MessageResponse) => {
        // Remove the contact from the current list
        this.contacts = this.contacts.filter(c => c._id !== this.contactIdToDelete);
        
        // Update total count
        this.totalContacts--;
        
        // Close the modal
        this.deleteModal?.hide();
        
        // If we deleted the last item on the page, go to the previous page
        if (this.contacts.length === 0 && this.currentPage > 1) {
          this.loadContacts(this.currentPage - 1);
        }
      },
      error: (err: any) => {
        console.error('Error deleting contact:', err);
        this.error = 'Failed to delete contact. Please try again later.';
        this.deleteModal?.hide();
      }
    });
  }
  
  onPageChange(page: number): void {
    this.loadContacts(page);
  }

  get totalPages(): number {
    return Math.ceil(this.totalContacts / this.pageSize);
  }

  get pages(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
} 