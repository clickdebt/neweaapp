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
  limit = 50;
  downloading = false;
  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private router: Router,
    private databaseService: DatabaseService,
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
    this.logo = localStorage.getItem('logo');
    this.syncOfflineVisitForm();
    this.startBackgroundEvent();
    // this.platform.pause.subscribe(() => {
    //   console.log('pause');
    //   this.startBackgroundEvent();
    // });
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
      this.caseService.getCaseSettings().subscribe(async (response: any) => {
        await this.storageService.set('fields', response.data.fields);
        this.saveTimeSettings(response.data.time);
      });
      const downloadStatus = await this.databaseService.getDownloadStatus();
      if (!downloadStatus || !downloadStatus.status) {
        this.loaderService.show();
        this.loaderService.displayText.next('Downloading Cases');
        forkJoin({
          cases: this.caseService.getCases({}, 1),
          visitForm: this.visitService.getVisitForm(),
          filterMasterData: this.caseService.getFilterMasterData(),
          feeOptions: this.caseActionService.getFeeOptions(1)
        }).subscribe(async (response: any) => {
          await this.databaseService.setCases(response.cases.data, response.cases.linked);
          await this.databaseService.setVisitForm(response.visitForm.data);
          await this.databaseService.setFilterMasterData(response.filterMasterData.data);
          await this.databaseService.setFeeOptions(response.feeOptions.data);
          await this.databaseService.setDownloadStatus({
            status: true,
            time: moment().format('YYYY-MM-DD HH:mm:ss')
          });
          this.loaderService.hide();
          await this.getcaseDetails();
        });
      } else {
        if (downloadStatus) {
          const diffMs = Math.floor((new Date(moment().format('YYYY-MM-DD HH:mm:ss')).getTime() - new Date(downloadStatus.time).getTime()) / 1000 / 60);
          if (diffMs >= 60) {
            this.caseService.getCases({ last_update_date: downloadStatus.time }, 1).subscribe(async (response: any) => {
              if (response) {
                await this.databaseService.setCases(response.data, response.linked);
                this.caseService.getFilterMasterData().subscribe(async (data: any) => {
                  await this.databaseService.setFilterMasterData(data.data);
                  await this.databaseService.setDownloadStatus({
                    status: true,
                    time: moment().format('YYYY-MM-DD HH:mm:ss')
                  });
                });
                await this.getcaseDetails();
              }
            });
          }
        }
      }
    }
  }

  async getcaseDetails() {
    let downloded = 0;
    this.downloading = true;
    this.caseService.getCaseDetails(1, this.limit).subscribe(async (data: any) => {
      let total = data.caseCountsVal;
      downloded = (data.caseCountsVal >= this.limit) ? this.limit : data.caseCountsVal;
      let page = 1
      await this.databaseService.setcaseDetails(data);
      let count = Math.floor((total - downloded) / this.limit);
      if (count > 0) {
        for (let i = 0; i <= count; i++) {
          this.caseService.getCaseDetails(++page, this.limit).subscribe(async (data) => {
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
    await this.databaseService.setHistoryDownloadStatus({
      status: status,
      time: moment().format('YYYY-MM-DD HH:mm:ss')
    });
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
    localStorage.removeItem('remote_token');
    localStorage.removeItem('userdata');
    await this.storageService.remove('database_filled');
    await this.storageService.remove('permissionArray');
    await this.storageService.remove('isVisitFormSync');
    await this.storageService.remove('fields');
    await this.storageService.remove('timeSettings');
    await this.storageService.remove('visit_form');
    await this.storageService.remove('filters');
    await this.storageService.remove('fee_options');
    await this.storageService.remove('visitOutcomes');
    await this.storageService.remove('downloadStatus');
    await this.storageService.remove('not_reload_map');
    await this.storageService.remove('permissionAsked');
    this.databaseService.clearData();
    this.router.navigate(['/login']);
  }
  async openPanicModal() {
    const panicModalPage = await this.modalCtrl.create({
      component: PanicModalPage, componentProps: { 'cssClass': 'case-action-modal' }
    });
    await panicModalPage.present();
  }
  syncOfflineVisitForm() {
    this.networkService.onNetworkChange().subscribe((response) => {
      if (response === 1) {
        this.saveUnsyncVisitForms();
      }
    });
  }

  startBackgroundEvent() {
    this.backgroundMode.setDefaults({ title: 'FieldAgent 3.0', ticker: 'FieldAgent 3.0', text: 'Running in Background' });
    this.backgroundMode.enable();
    this.bgSubscription = this.backgroundMode.on('activate').subscribe(() => {
      console.log('active');
      this.bgNetworkSubscription = this.network.onConnect().subscribe(() => {
        console.log('net connected');
        this.saveUnsyncVisitForms();
      });
    });
    this.backgroundMode.on('deactivate').subscribe(() => {
      setTimeout(() => {
        console.log('deactive');
        // this.bgSubscription.unsubscribe();
        this.bgNetworkSubscription.unsubscribe();
        // this.backgroundMode.disable();
      }, 300);
    });
  }

  async saveUnsyncVisitForms() {
    if (!await this.storageService.get('isVisitFormSync')) {
      this.databaseService.getApiStored().then(async (data) => {
        if (data) {
          var currentFormData;
          for (let i = 0; i < data.rows.length; i++) {
            currentFormData = data.rows.item(i);
            let form_data = JSON.parse(decodeURI(currentFormData.data));
            let callResponse = await this.databaseService.callHttpApi(currentFormData.type, localStorage.getItem('server_url') + currentFormData.url, { body: form_data });
            if (callResponse) {
              this.databaseService.markApiCallSuccess(currentFormData.id);
              this.databaseService.getcaseDetailsData(currentFormData.case_id)
            }
          }
        }
      });
    }
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
