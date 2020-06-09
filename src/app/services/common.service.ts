import { Injectable } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  loader;
  permissionSlug = {
    AddPayment: 'app_take_payment',
    AddArrangement: 'app_make_arrangement',
    Document: 'app_upload_document',
    VRM: 'app_vrm_search',
    SelfAllocate: 'app_self_allocate',
    DeAllocate: 'app_deallocate_case',
  };
  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private storageService: StorageService
  ) {

  }

  async showToast(msg, clr = 'light') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 4000,
      position: 'bottom',
      color: clr
    });
    toast.present();
  }

  async showLoader(content = 'Loading ...') {
    this.loader = await this.loadingController.create({
      message: content
    });
    this.loader.present();
  }

  async dismissLoader() {
    if (this.loader) {
      await this.loader.dismiss();
    }
  }

  isClient(name) {
    return localStorage.getItem('server_url').indexOf(name) > -1;
  }
  async hasPermission(item) {
    const permissionArray = await this.storageService.get('permissionArray');
    if (permissionArray && permissionArray.indexOf(item) !== -1) {
      return true;
    }
    return false;
  }
}
