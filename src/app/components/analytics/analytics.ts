import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { MenuItemService } from '../../services/menu-item';
import { OrderService } from '../../services/order';
import { CustomerService } from '../../services/customer';
import { MenuItem } from '../../models/menu-item.model';
import { Order } from '../../models/order.model';
import { Customer } from '../../models/customer.model';
import { combineLatest } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit, AfterViewInit {
  // Canvas elements are always in the DOM (not inside @if), so ViewChild is stable
  @ViewChild('popularChart') popularChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

  menuItems: MenuItem[] = [];
  orders: Order[] = [];
  customers: Customer[] = [];
  loading = true;

  totalRevenue = 0;
  avgOrderValue = 0;
  topItem = '';
  topCustomer = '';

  private popularChart?: Chart;
  private revenueChart?: Chart;
  private statusChart?: Chart;
  private viewInitDone = false;
  private dataLoaded = false;

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
        this.menuItems = items;
        this.orders = orders;
        this.customers = customers.sort((a, b) => b.totalSpent - a.totalSpent);
        this.calcSummary();
        this.loading = false;
        this.dataLoaded = true;
        this.tryRenderCharts();
        this.cdr.detectChanges();
      });
    });
  }

  ngAfterViewInit(): void {
    this.viewInitDone = true;
    this.tryRenderCharts();
  }

  private tryRenderCharts(): void {
    if (!this.viewInitDone || !this.dataLoaded) return;
    this.renderPopularItemsChart();
    this.renderRevenueByDayChart();
    this.renderStatusChart();
  }

  private calcSummary(): void {
    const delivered = this.orders.filter((o) => o.status === 'delivered');
    this.totalRevenue = delivered.reduce((s, o) => s + o.totalAmount, 0);
    this.avgOrderValue = delivered.length ? this.totalRevenue / delivered.length : 0;
    const sorted = [...this.menuItems].sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0));
    this.topItem = sorted[0]?.name ?? '—';
    this.topCustomer = this.customers[0]?.name ?? '—';
  }

  private renderPopularItemsChart(): void {
    const sorted = [...this.menuItems]
      .sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0))
      .slice(0, 8);
    this.popularChart?.destroy();
    this.popularChart = new Chart(this.popularChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: sorted.map((i) => i.name),
        datasets: [{
          label: 'Times Ordered',
          data: sorted.map((i) => i.orderCount ?? 0),
          backgroundColor: sorted.map((_, idx) => idx === 0 ? '#ffc107' : 'rgba(13,110,253,0.7)'),
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }

  private renderRevenueByDayChart(): void {
    const days: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
    }
    this.orders
      .filter((o) => o.status === 'delivered')
      .forEach((o) => {
        const label = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (label in days) days[label] += o.totalAmount;
      });
    this.revenueChart?.destroy();
    this.revenueChart = new Chart(this.revenueChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: Object.keys(days),
        datasets: [{
          label: 'Revenue ($)',
          data: Object.values(days),
          borderColor: '#198754',
          backgroundColor: 'rgba(25,135,84,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  private renderStatusChart(): void {
    const counts: Record<string, number> = {};
    this.orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    const colors: Record<string, string> = {
      pending: '#ffc107', preparing: '#0dcaf0',
      ready: '#198754', delivered: '#6c757d', cancelled: '#dc3545',
    };
    this.statusChart?.destroy();
    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts).map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: Object.keys(counts).map((k) => colors[k] ?? '#adb5bd'),
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }
}
