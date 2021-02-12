import { Injectable } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { StorageService } from './storage.service';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

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
  appName = 'Lateral EA';
  newlynURLS = [
    'https://production.newlynservices.co.uk/',
    'https://staging.newlynservices.co.uk/',
    'https://production.staging.omnicrm.co/',
    'https://production.nodeb.lateral1.com/'
  ];
  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private storageService: StorageService,
    private diagnostic: Diagnostic,
    private locationAccuracy: LocationAccuracy,
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
      message: content,
      duration: 10000
    });
    this.loader.present();
  }

  async dismissLoader() {
    if (this.loader) {
      await this.loader.dismiss();
    }
  }

  isClient(name) {
    if(name == 'newlyn') {
      return this.newlynURLS.indexOf(localStorage.getItem('server_url')) > -1
    }
    return localStorage.getItem('server_url').indexOf(name) > -1;
  }
  async hasPermission(item) {
    let permissionArray = await this.storageService.get('permissionArray');
    if(!permissionArray) {
      let userdata : any = localStorage.getItem('userdata');
      userdata = JSON.parse(userdata);
      
      if (userdata.user_permissions) {
        const permissions = userdata.user_permissions;
        let permissionArr = [];
        permissions.filter(per => {
          const p = Object.keys(per).filter(element => {
            return per[element] == true;
          });
          permissionArr = permissionArr.concat(p);
        });
        // console.log(permissionArr);
        await this.storageService.set('permissionArray', permissionArr);
        permissionArray =  permissionArr;
      }
    }
    if (permissionArray && permissionArray.indexOf(item) !== -1) {
      return true;
    }
    return false;
  }
  askUserPermissions() {
    this.storageService
      .get('permissionAsked')
      .then(permissionAsked => {
        if (!permissionAsked) {
          const permissions = [
            this.diagnostic.permission.READ_EXTERNAL_STORAGE,
            this.diagnostic.permission.WRITE_EXTERNAL_STORAGE,
            this.diagnostic.permission.ACCESS_FINE_LOCATION,
            this.diagnostic.permission.ACCESS_COARSE_LOCATION
          ];
          this.diagnostic
            .requestRuntimePermissions(permissions)
            .then(
              statuses => {
                // tslint:disable-next-line: forin
                for (const permission in statuses) {
                  switch (statuses[permission]) {
                    case this.diagnostic.permissionStatus.GRANTED:
                      // console.log('Permission granted to use ' + permission);
                      break;
                    case this.diagnostic.permissionStatus.NOT_REQUESTED:
                      // console.log('Permission to use ' + permission + ' has not been requested yet');
                      break;
                    // tslint:disable-next-line: deprecation
                    case this.diagnostic.permissionStatus.DENIED:
                      // console.log('Permission denied to use ' + permission + ' - ask again?');
                      break;
                    case this.diagnostic.permissionStatus.DENIED_ALWAYS:
                      // console.log('Permission permanently denied to use ' + permission + ' - guess we won't be using it then!');
                      break;
                  }
                }
              },
              error => {
                console.error('The following error occurred: ' + error);
              }
            )
            .finally(() => {
              this.storageService.set(
                'permissionAsked',
                true
              );
            });
        }
      });
  }
  checkLocation() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => console.log('Request successful'),
          error => console.log('Error requesting location permissions', error)
        );
      }
    });
  }
}
