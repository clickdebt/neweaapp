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
}
