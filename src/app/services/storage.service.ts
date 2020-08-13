import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AES256 } from '@ionic-native/aes-256/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  secureKey;
  secureIV;
  constructor(
    private storage: Storage,
    private aes256: AES256,
    private platform: Platform
  ) {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.secureKey = 'E3l5wbSvHl0Qhiq0MSisECWO7C1tV2oj';
      this.secureIV = 'u3a5wIA73vmG6ruB';
    }
  }

  async encrypt(data) {
    const str = JSON.stringify(data);
    return await this.aes256.encrypt(this.secureKey, this.secureIV, str)
      .then(res => {
        return res;
      })
      .catch((error: any) => console.error(error));
  }

  async decrypt(data) {
    return await this.aes256.decrypt(this.secureKey, this.secureIV, data)
      .then(res => {
        if (res) {
          return JSON.parse(res);
        }
        return res;

      })
      .catch((error: any) => console.error(error));
  }

  async get(key) {
    if (this.platform.is('android') || this.platform.is('ios')) {
      return await this.decrypt(await this.storage.get(key));
    } else {
      return await this.storage.get(key);
    }
  }

  async remove(key) {
    return await this.storage.remove(key);
  }

  async set(key, value) {
    if (this.platform.is('android') || this.platform.is('ios')) {
      const vv = await this.encrypt(value);
      return await this.storage.set(key, vv);
    } else {
      return await this.storage.set(key, value);
    }

  }
}
