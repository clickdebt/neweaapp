import { Injectable } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  loader;
  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {

  }

  async showToast(msg, clr = 'success') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 4000,
      position: 'top',
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

  dismissLoader() {
    if (this.loader)
      this.loader.dismiss();
  }
}
