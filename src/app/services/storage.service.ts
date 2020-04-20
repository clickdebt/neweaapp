import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: Storage
  ) { }

  async get(key) {
    return await this.storage.get(key);
  }

  async remove(key) {
    return await this.storage.remove(key);
  }

  async set(key, value) {
    return await this.storage.set(key, value);
  }
}
