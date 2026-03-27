import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MenuItemService } from '../../services/menu-item';
import { MenuItem } from '../../models/menu-item.model';

const CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Drinks', 'Sides'];

@Component({
  selector: 'app-menu-items',
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-items.html',
  styleUrl: './menu-items.css',
})
export class MenuItems implements OnInit {
  items: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories = CATEGORIES;
  loading = true;
  saving = false;
  errorMsg = '';
  successMsg = '';

  searchTerm = '';
  filterCategory = '';
  sortField: keyof MenuItem = 'name';
  sortAsc = true;

  showForm = false;
  formValidated = false;
  editingId: string | null = null;
  form: Omit<MenuItem, 'id'> = this.emptyForm();

  constructor(private menuItemService: MenuItemService, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.menuItemService.getAll().subscribe((items) => {
      this.zone.run(() => {
        this.items = items;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  applyFilter(): void {
    let result = [...this.items];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term)
      );
    }
    if (this.filterCategory) {
      result = result.filter((i) => i.category === this.filterCategory);
    }
    result.sort((a, b) => {
      const aVal = a[this.sortField] ?? '';
      const bVal = b[this.sortField] ?? '';
      if (aVal < bVal) return this.sortAsc ? -1 : 1;
      if (aVal > bVal) return this.sortAsc ? 1 : -1;
      return 0;
    });
    this.filteredItems = result;
  }

  toggleSort(field: keyof MenuItem): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.applyFilter();
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.formValidated = false;
    this.showForm = true;
  }

  openEdit(item: MenuItem): void {
    this.editingId = item.id!;
    this.form = { name: item.name, category: item.category, price: item.price, description: item.description, available: item.available };
    this.formValidated = false;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.formValidated = false;
    this.errorMsg = '';
  }

  async saveItem(formEl: NgForm): Promise<void> {
    this.formValidated = true;
    if (!formEl.valid) return;
    this.saving = true;
    this.errorMsg = '';
    try {
      if (this.editingId) {
        await this.menuItemService.update(this.editingId, this.form);
      } else {
        await this.menuItemService.create({ ...this.form, orderCount: 0 });
      }
      this.zone.run(async () => {
        this.showForm = false;
        this.saving = false;
        this.showSuccess(this.editingId ? 'Item updated.' : 'Item added.');
      });
    } catch {
      this.zone.run(() => {
        this.errorMsg = 'Failed to save. Please try again.';
        this.saving = false;
      });
    }
  }

  async deleteItem(item: MenuItem): Promise<void> {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await this.menuItemService.delete(item.id!);
    this.zone.run(() => {
      this.showSuccess('Item deleted.');
    });
  }

  private emptyForm(): Omit<MenuItem, 'id'> {
    return { name: '', category: '', price: 0, description: '', available: true };
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ''), 3000);
  }
}
