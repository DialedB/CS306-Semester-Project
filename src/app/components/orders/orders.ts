import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order';
import { MenuItemService } from '../../services/menu-item';
import { CustomerService } from '../../services/customer';
import { Order, OrderItem } from '../../models/order.model';
import { MenuItem } from '../../models/menu-item.model';
import { Customer } from '../../models/customer.model';
import { combineLatest } from 'rxjs';

const STATUSES: Order['status'][] = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  menuItems: MenuItem[] = [];
  customers: Customer[] = [];
  loading = true;
  saving = false;
  errorMsg = '';
  successMsg = '';

  statuses = STATUSES;
  filterStatus = '';
  searchTerm = '';
  sortAsc = false;

  showForm = false;
  formValidated = false;
  selectedCustomerId = '';
  orderItems: { menuItemId: string; qty: number }[] = [{ menuItemId: '', qty: 1 }];

  constructor(
    private orderService: OrderService,
    private menuItemService: MenuItemService,
    private customerService: CustomerService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.orderService.getAll(),
      this.menuItemService.getAll(),
      this.customerService.getAll(),
    ]).subscribe(([orders, items, customers]) => {
      this.zone.run(() => {
        this.orders = orders;
        this.menuItems = items.filter((i) => i.available);
        this.customers = customers;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  applyFilter(): void {
    let result = [...this.orders];
    if (this.filterStatus) result = result.filter((o) => o.status === this.filterStatus);
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((o) => o.customerName.toLowerCase().includes(term));
    }
    result.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return this.sortAsc ? diff : -diff;
    });
    this.filteredOrders = result;
  }

  openCreate(): void {
    this.selectedCustomerId = '';
    this.orderItems = [{ menuItemId: '', qty: 1 }];
    this.formValidated = false;
    this.showForm = true;
    this.errorMsg = '';
  }

  cancelForm(): void {
    this.showForm = false;
    this.errorMsg = '';
  }

  addOrderItem(): void {
    this.orderItems.push({ menuItemId: '', qty: 1 });
  }

  removeOrderItem(index: number): void {
    this.orderItems.splice(index, 1);
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.menuItems.find((m) => m.id === id);
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  calcFormTotal(): number {
    return this.orderItems.reduce((sum, li) => {
      const item = this.getMenuItemById(li.menuItemId);
      return sum + (item ? item.price * li.qty : 0);
    }, 0);
  }

  async saveOrder(): Promise<void> {
    this.formValidated = true;
    if (!this.selectedCustomerId) { this.errorMsg = 'Please select a customer.'; return; }
    const validLines = this.orderItems.filter((li) => li.menuItemId && li.qty > 0);
    if (validLines.length === 0) { this.errorMsg = 'Add at least one menu item.'; return; }

    const customer = this.getCustomerById(this.selectedCustomerId)!;
    const builtItems: OrderItem[] = validLines.map((li) => {
      const mi = this.getMenuItemById(li.menuItemId)!;
      return { menuItemId: mi.id!, menuItemName: mi.name, price: mi.price, quantity: li.qty };
    });
    const total = +(builtItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2));

    this.saving = true;
    this.errorMsg = '';
    try {
      await this.orderService.create({
        customerId: customer.id!, customerName: customer.name,
        items: builtItems, totalAmount: total,
        status: 'pending', createdAt: new Date().toISOString(),
      });
      await this.customerService.addOrderStats(customer.id!, total, customer.totalSpent, customer.orderCount);
      for (const li of validLines) {
        const mi = this.getMenuItemById(li.menuItemId)!;
        await this.menuItemService.incrementOrderCount(mi.id!, mi.orderCount ?? 0);
      }
      this.zone.run(async () => {
        this.showForm = false;
        this.saving = false;
        this.showSuccess('Order placed.');
      });
    } catch {
      this.zone.run(() => {
        this.errorMsg = 'Failed to save order.';
        this.saving = false;
      });
    }
  }

  async updateStatus(order: Order, status: Order['status']): Promise<void> {
    await this.orderService.updateStatus(order.id!, status);
    this.zone.run(() => {
      order.status = status;
      this.applyFilter();
    });
  }

  async deleteOrder(order: Order): Promise<void> {
    if (!confirm('Delete this order?')) return;
    await this.orderService.delete(order.id!);
    this.zone.run(() => {
      this.orders = this.orders.filter((o) => o.id !== order.id);
      this.applyFilter();
      this.showSuccess('Order deleted.');
    });
  }

  getStatusClass(status: string): string {
    return `badge-${status}`;
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }
}
