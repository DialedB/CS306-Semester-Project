import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase';
import { Order } from '../models/order.model';
import { Observable } from 'rxjs';

const PATH = 'orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private fb: FirebaseService) {}

  getAll(): Observable<Order[]> {
    return this.fb.getListObservable<Order>(PATH);
  }

  create(order: Omit<Order, 'id'>): Promise<string> {
    return this.fb.create(PATH, order);
  }

  updateStatus(id: string, status: Order['status']): Promise<void> {
    return this.fb.update(PATH, id, { status });
  }

  update(id: string, order: Partial<Order>): Promise<void> {
    return this.fb.update(PATH, id, order);
  }

  delete(id: string): Promise<void> {
    return this.fb.delete(PATH, id);
  }
}
