import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  Database,
  ref,
  set,
  push,
  get,
  update,
  remove,
  child,
  onValue,
} from 'firebase/database';
import { Observable } from 'rxjs';

// TODO: Replace with your Firebase project config from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCaBod_-tGxwNiFnlzG3gHQmewzmbadUhs",
  databaseURL: "https://semester-project-cs306-default-rtdb.europe-west1.firebasedatabase.app/",
};

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app: FirebaseApp;
  private db: Database;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
  }

  // Create — pushes a new record and returns the generated key
  async create(path: string, data: object): Promise<string> {
    const listRef = ref(this.db, path);
    const newRef = push(listRef);
    await set(newRef, data);
    return newRef.key!;
  }

  // Read all records at a path (one-shot fetch)
  async getAll<T = any>(path: string): Promise<(T & { id: string })[]> {
    const snapshot = await get(ref(this.db, path));
    if (!snapshot.exists()) return [];
    const raw = snapshot.val();
    return Object.keys(raw).map((id) => ({ id, ...raw[id] })) as any[];
  }

  // Read all records at a path in real-time
  getListObservable<T = any>(path: string): Observable<(T & { id: string })[]> {
    return new Observable((observer) => {
      const listRef = ref(this.db, path);
      const unsubscribe = onValue(
        listRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            observer.next([]);
          } else {
            const raw = snapshot.val();
            const arr = Object.keys(raw).map((id) => ({ id, ...raw[id] }));
            observer.next(arr as any[]);
          }
        },
        (error) => observer.error(error)
      );
      // Return teardown logic to unsubscribe when the observable is unsubscribed
      return () => unsubscribe();
    });
  }

  // Read one record by id
  async getOne(path: string, id: string): Promise<any> {
    const snapshot = await get(child(ref(this.db), `${path}/${id}`));
    if (!snapshot.exists()) return null;
    return { id, ...snapshot.val() };
  }

  // Update (partial merge)
  async update(path: string, id: string, data: object): Promise<void> {
    await update(ref(this.db, `${path}/${id}`), data);
  }

  // Delete
  async delete(path: string, id: string): Promise<void> {
    await remove(ref(this.db, `${path}/${id}`));
  }
}
