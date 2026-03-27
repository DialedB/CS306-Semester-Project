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

  async create(path: string, data: object): Promise<string> {
    const listRef = ref(this.db, path);
    const newRef = push(listRef);
    await set(newRef, data);
    return newRef.key!;
  }

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
      return () => unsubscribe();
    });
  }

  async getOne(path: string, id: string): Promise<any> {
    const snapshot = await get(child(ref(this.db), `${path}/${id}`));
    if (!snapshot.exists()) return null;
    return { id, ...snapshot.val() };
  }

  async update(path: string, id: string, data: object): Promise<void> {
    await update(ref(this.db, `${path}/${id}`), data);
  }

  async delete(path: string, id: string): Promise<void> {
    await remove(ref(this.db, `${path}/${id}`));
  }
}
