import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NetworkService, ConnectionStatus } from './services/network.service';
import { CommonService, StorageService } from './services';
import { CaseDetailsService } from './services/case-details.service';
import { CaseActionService } from './services/case-action.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private networkService: NetworkService,
    private commonService: CommonService,
    private storageService: StorageService,
    private caseActionService: CaseActionService) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.commonService.checkLocation();
      this.commonService.askUserPermissions();
      this.networkService.onNetworkChange().subscribe(async (status: ConnectionStatus) => {
        if (status === ConnectionStatus.Online) {
          // Perform upload to server
          // this.caseActionService.offlineActions();

        } else if (status === ConnectionStatus.Offline) {
          // Perform upload to storage
        }
      });
    });
  }

  ngOnInit() {
  }
}
