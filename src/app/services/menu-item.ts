import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase';
import { MenuItem } from '../models/menu-item.model';
import { Observable } from 'rxjs';

const PATH = 'menuItems';

@Injectable({ providedIn: 'root' })
export class MenuItemService {
  constructor(private fb: FirebaseService) {}

  getAll(): Observable<MenuItem[]> {
    return this.fb.getListObservable<MenuItem>(PATH);
  }

  getOne(id: string): Promise<MenuItem> {
    return this.fb.getOne(PATH, id);
  }

  create(item: Omit<MenuItem, 'id'>): Promise<string> {
    return this.fb.create(PATH, item);
  }

  update(id: string, item: Partial<MenuItem>): Promise<void> {
    return this.fb.update(PATH, id, item);
  }

  delete(id: string): Promise<void> {
    return this.fb.delete(PATH, id);
  }

  // Increment order count for analytics tracking
  async incrementOrderCount(id: string, currentCount: number): Promise<void> {
    return this.fb.update(PATH, id, { orderCount: currentCount + 1 });
  }
}
