import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService, CaseService, VisitService, StorageService, CommonService } from '../services';
import { PanicModalPage } from '../pages/panic-modal/panic-modal.page';
import { forkJoin } from 'rxjs';
import { NetworkService } from '../services/network.service';
import * as moment from 'moment';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Network } from '@ionic-native/network/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { CaseActionService } from '../services/case-action.service';
import { LoaderService } from '../services/loader.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  logo;
  server_url;
  username;
  cases = [];
  bgSubscription;
  hasVRMpermission = false;
  bgNetworkSubscription;
  bgApiChecker;
  limit = 50;
  downloading = false;
  last_updated_date = '';
  showRefreshingData = false;
  showSyncingData = false;
  appName = '';
  refreshBtnDisable = false;
  appVersion = '';
  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private router: Router,
    private   databaseService: DatabaseService,
    private caseService: CaseService,
    private modalCtrl: ModalController,
    private visitService: VisitService,
    private networkService: NetworkService,
    private storageService: StorageService,
    private backgroundMode: BackgroundMode,
    private network: Network,
    private commonService: CommonService,
    private statusBar: StatusBar,
    private caseActionService: CaseActionService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.appName = this.commonService.appName;
    this.logo = localStorage.getItem('logo');
    this.startBackgroundEvent();
    this.databaseService.lastUpdateTime.subscribe(date => {
      this.last_updated_date = date;
    });
    this.databaseService.refreshingData.subscribe(refreshingData => {
      this.showRefreshingData = refreshingData;
    });
    this.databaseService.syncingAPI.subscribe(res => {
      this.showSyncingData =  res;
    });
    this.appVersion = this.commonService.getAppVersion();
  }

  ionViewWillEnter() {
    this.statusBar.styleLightContent();
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString('#000');
    this.server_url = localStorage.getItem('server_url');
    this.username = JSON.parse(localStorage.getItem('userdata')).name;
    this.checkPermissions();
  }
  async checkPermissions() {
    this.hasVRMpermission = await this.commonService.hasPermission(this.commonService.permissionSlug.VRM);
  }
  async ionViewDidEnter() {
    if (this.networkService.getCurrentNetworkStatus() === 1) {
      const downloadStatus = await this.databaseService.getDownloadStatus();
      if (!downloadStatus || !downloadStatus.status) {
        this.caseService.getCaseSettings().subscribe(async (response: any) => {
          await this.storageService.set('fields', response.data.fields);
          this.saveTimeSettings(response.data.time);
        });
        this.loaderService.show();
        this.loaderService.displayText.next('Downloading Cases');
        forkJoin({
          cases: this.caseService.getCases({}, 1),
          visitForm: this.visitService.getVisitForm(),
          filterMasterData: this.caseService.getFilterMasterData(),
          feeOptions: this.caseService.getFeeSchemeManagerLinks(),
        }).subscribe(async (response: any) => {
          await this.databaseService.setCases(response.cases.data, response.cases.linked, response.cases.allCases);
          await this.databaseService.setVisitForm(response.visitForm.data);
          await this.databaseService.setFilterMasterData(response.filterMasterData.data);
          await this.databaseService.setFeeOptions(response.feeOptions.data.FeeSchemeManagerLinks);
          const time = moment().format('YYYY-MM-DD HH:mm:ss');
          await this.databaseService.setDownloadStatus({
            status: true,
            time: time
          });
          this.databaseService.setlastUpdateTime(time);
          this.loaderService.hide();
          await this.getcaseDetails();
        });
      } else {
        if (downloadStatus) {
          this.databaseService.setlastUpdateTime(downloadStatus.time)
          const diffMs = Math.floor((new Date(moment().format('YYYY-MM-DD HH:mm:ss')).getTime() - new Date(downloadStatus.time).getTime()) / 1000 / 60);
          if (diffMs >= 60) {
            this.caseService.getCases({ last_update_date: downloadStatus.time }, 1).subscribe(async (response: any) => {
              if (response) {
                await this.databaseService.setCases(response.data, response.linked, response.allCases);
                this.caseService.getFilterMasterData().subscribe(async (data: any) => {
                  await this.databaseService.setFilterMasterData(data.data);
                  const time = moment().format('YYYY-MM-DD HH:mm:ss');
                  await this.databaseService.setDownloadStatus({
                    status: true,
                    time: time
                  });
                  this.databaseService.setlastUpdateTime(time);
                });
                await this.getcaseDetails(downloadStatus.time);
              }
            });
          }
        }
      }
      setInterval(() => { this.refreshData() }, 1000 * 60 * 60);
    }
  }

  async getcaseDetails(last_update_date = '') {
    let downloded = 0;
    this.downloading = true;
    this.caseService.getCaseDetails({ page: 1, limit: this.limit, last_update_date: last_update_date }).subscribe(async (data: any) => {
      let total = data.caseCountsVal;
      downloded = (data.caseCountsVal >= this.limit) ? this.limit : data.caseCountsVal;
      let page = 1
      await this.databaseService.setcaseDetails(data);
      let count = Math.floor((total - downloded) / this.limit);
      if (count > 0) {
        for (let i = 0; i <= count; i++) {
          this.caseService.getCaseDetails({ page: ++page, limit: this.limit, last_update_date: last_update_date }).subscribe(async (data) => {
            downloded += this.limit;
            if (downloded > total) {
              downloded = total;
            }
            await this.databaseService.setcaseDetails(data);
            if (downloded >= total) {
              await this.setHistoryDownloadStatus();
            }
          }, (err) => {
            console.log(err);
            this.setHistoryDownloadStatus(false);
          });
        }
      } else {
        await this.setHistoryDownloadStatus();
      }
    }, (err) => {
      console.log(err);
      this.setHistoryDownloadStatus(false);
    });
  }

  async setHistoryDownloadStatus(status = true) {
    this.downloading = false;
    this.databaseService.setDetailsDownloadState(true);
    await this.databaseService.setHistoryDownloadStatus({
      status: status,
      time: moment().format('YYYY-MM-DD HH:mm:ss')
    });
  }

  async refreshData() {
    const downloadStatus = await this.databaseService.getDownloadStatus();
    if (downloadStatus) {
      const params = { last_update_date: downloadStatus.time };
      this.databaseService.refreshData(params).then(() => {
      });
    }
  }
  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Logout!',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Logout',
          handler: () => {
            this.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {

    this.databaseService.clearData();
    this.router.navigate(['/login']);
  }
  async openPanicModal() {
    const panicModalPage = await this.modalCtrl.create({
      component: PanicModalPage, componentProps: { 'cssClass': 'case-action-modal' }
    });
    await panicModalPage.present();
  }
  async doRefresh() {
    if (this.networkService.getCurrentNetworkStatus() === 1) {
      this.refreshBtnDisable = true;
      const downloadStatus = await this.databaseService.getDownloadStatus();
      if (downloadStatus) {
        const params = {};
        this.loaderService.show();
        this.loaderService.displayText.next('Downloading Cases');
        await this.databaseService.executeQuery('delete from rdebt_cases');
        await this.databaseService.executeQuery('delete from rdebt_linked_cases');
        this.caseService.getCases(params, 1).subscribe(async(response: any)=>{
          await this.databaseService.setCases(response.data, response.linked, response.allCases);
          this.caseService.getCaseDetails(params).subscribe(async(response: any) =>{
            await this.databaseService.setcaseDetails(response);
            await this.databaseService.updateLastUpdatedDates();
            this.refreshBtnDisable = false;
            this.loaderService.hide();
          });
        });
      }
    }
  }

  startBackgroundEvent() {
    this.backgroundMode.setDefaults({ title: this.commonService.appName, ticker: this.commonService.appName, text: 'Running in Background', silent: true });
    this.backgroundMode.enable();
    // this.bgSubscription = this.backgroundMode.on('activate').subscribe(() => {
    //   console.log('active');
    //   this.bgNetworkSubscription = this.network.onConnect().subscribe(() => {
    //     console.log('net connected');
    //     this.databaseService.checkApiPending('home');
    //   });
    // });
    // this.backgroundMode.on('deactivate').subscribe(() => {
    //   setTimeout(() => {
    //     console.log('deactive');
    //     this.bgNetworkSubscription.unsubscribe();
    //     // this.backgroundMode.disable();
    //   }, 300);
    // });
  }

  saveTimeSettings(timeSettings) {
    timeSettings = timeSettings.map((time) => {
      const res = time.split(' ');
      let totalSeconds = 0;
      let displayText = '';
      const hours = parseInt(res[0], 10);
      const minutes = parseInt(res[2], 10);
      const seconds = parseInt(res[4], 10);
      if (hours) {
        totalSeconds += hours * 60 * 60;
        displayText += res[0] + ' ' + res[1] + ' ';
      }
      if (minutes) {
        totalSeconds += minutes * 60;
        displayText += res[2] + ' ' + res[3] + ' ';
      }
      if (seconds) {
        totalSeconds += seconds;
        displayText += res[4] + ' ' + res[5];
      }
      return { time: totalSeconds, label: displayText };
    });
    this.storageService.set('timeSettings', timeSettings);
  }
}
