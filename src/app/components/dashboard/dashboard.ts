import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenuItemService } from '../../services/menu-item';
import { OrderService } from '../../services/order';
import { CustomerService } from '../../services/customer';
import { Order } from '../../models/order.model';
import { Customer } from '../../models/customer.model';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  totalMenuItems = 0;
  totalOrders = 0;
  totalCustomers = 0;
  totalRevenue = 0;
  recentOrders: Order[] = [];
  topCustomers: Customer[] = [];
  loading = true;

  constructor(
    private menuItemService: MenuItemService,
    private orderService: OrderService,
    private customerService: CustomerService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.menuItemService.getAll(),
      this.orderService.getAll(),
      this.customerService.getAll(),
    ]).subscribe(([items, orders, customers]) => {
      this.zone.run(() => {
        this.totalMenuItems = items.length;
        this.totalOrders = orders.length;
        this.totalCustomers = customers.length;
        this.totalRevenue = orders
          .filter((o) => o.status === 'delivered')
          .reduce((sum, o) => sum + o.totalAmount, 0);
        this.recentOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.topCustomers = [...customers]
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 3);
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  getStatusClass(status: string): string {
    return `badge-${status}`;
  }
}
