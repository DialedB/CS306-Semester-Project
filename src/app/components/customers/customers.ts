import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CustomerService } from '../../services/customer';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = true;
  saving = false;
  errorMsg = '';
  successMsg = '';

  searchTerm = '';
  sortField: keyof Customer = 'name';
  sortAsc = true;

  showForm = false;
  formValidated = false;
  editingId: string | null = null;
  form: Omit<Customer, 'id'> = this.emptyForm();

  constructor(private customerService: CustomerService, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.customerService.getAll().subscribe((customers) => {
      this.zone.run(() => {
        this.customers = customers;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }



  applyFilter(): void {
    let result = [...this.customers];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.includes(term)
      );
    }
    result.sort((a, b) => {
      const aVal = a[this.sortField] ?? '';
      const bVal = b[this.sortField] ?? '';
      if (aVal < bVal) return this.sortAsc ? -1 : 1;
      if (aVal > bVal) return this.sortAsc ? 1 : -1;
      return 0;
    });
    this.filteredCustomers = result;
  }

  toggleSort(field: keyof Customer): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.applyFilter();
  }

  isTopCustomer(customer: Customer): boolean {
    if (this.customers.length === 0) return false;
    const sorted = [...this.customers].sort((a, b) => b.totalSpent - a.totalSpent);
    const threshold = Math.ceil(sorted.length * 0.25);
    return sorted.indexOf(customer) < threshold && customer.totalSpent > 0;
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.formValidated = false;
    this.showForm = true;
  }

  openEdit(c: Customer): void {
    this.editingId = c.id!;
    this.form = { name: c.name, email: c.email, phone: c.phone, totalSpent: c.totalSpent, orderCount: c.orderCount };
    this.formValidated = false;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formValidated = false;
    this.errorMsg = '';
  }

  async saveCustomer(formEl: NgForm): Promise<void> {
    this.formValidated = true;
    if (!formEl.valid) return;
    this.saving = true;
    this.errorMsg = '';
    try {
      if (this.editingId) {
        await this.customerService.update(this.editingId, this.form);
      } else {
        await this.customerService.create(this.form);
      }
      this.zone.run(async () => {
        this.showForm = false;
        this.saving = false;
        this.showSuccess(this.editingId ? 'Customer updated.' : 'Customer added.');
      });
    } catch {
      this.zone.run(() => {
        this.errorMsg = 'Failed to save. Please try again.';
        this.saving = false;
      });
    }
  }

  async deleteCustomer(c: Customer): Promise<void> {
    if (!confirm(`Delete "${c.name}"?`)) return;
    await this.customerService.delete(c.id!);
    this.zone.run(() => {
      this.showSuccess('Customer deleted.');
    });
  }

  private emptyForm(): Omit<Customer, 'id'> {
    return { name: '', email: '', phone: '', totalSpent: 0, orderCount: 0 };
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }
}
