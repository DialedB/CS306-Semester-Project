import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase';
import { Customer } from '../models/customer.model';
import { Observable } from 'rxjs';

const PATH = 'customers';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private fb: FirebaseService) {}

  getAll(): Observable<Customer[]> {
    return this.fb.getListObservable<Customer>(PATH);
  }

  create(customer: Omit<Customer, 'id'>): Promise<string> {
    return this.fb.create(PATH, customer);
  }

  update(id: string, customer: Partial<Customer>): Promise<void> {
    return this.fb.update(PATH, id, customer);
  }

  delete(id: string): Promise<void> {
    return this.fb.delete(PATH, id);
  }

  async addOrderStats(id: string, amount: number, currentSpent: number, currentCount: number): Promise<void> {
    return this.fb.update(PATH, id, {
      totalSpent: +(currentSpent + amount).toFixed(2),
      orderCount: currentCount + 1,
    });
  }
}
