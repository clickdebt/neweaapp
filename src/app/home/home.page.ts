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
    private statusBar: StatusBar
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
    this.caseService.getCaseSettings().subscribe(async (response: any) => {
      await this.storageService.set('fields', response.data.fields);
      this.saveTimeSettings(response.data.time);
    });
    if ((this.platform.is('android') || this.platform.is('ios'))
      && this.networkService.getCurrentNetworkStatus() === 1) {
      const downloadStatus = await this.databaseService.getDownloadStatus();
      if (!downloadStatus || !downloadStatus.status) {
        forkJoin({
          cases: this.caseService.getCases({}, 1),
          visitForm: this.visitService.getVisitForm(),
          filterMasterData: this.caseService.getFilterMasterData(),
          visitOutcomes: this.caseService.getVisitOutcomes(0)
        }).subscribe(async (response: any) => {
          await this.databaseService.setCases(response.cases.data, response.cases.linked);
          await this.databaseService.setVisitForm(response.visitForm.data);
          await this.databaseService.setFilterMasterData(response.filterMasterData.data);
          await this.databaseService.setvisitOutcomes(response.visitOutcomes.data);
          await this.databaseService.setDownloadStatus({
            status: true,
            time: moment().format('YYYY-MM-DD hh:mm:ss')
          });
        });
      } else {
        if (downloadStatus) {
          const diffMs = Math.floor((new Date().getTime() - new Date(downloadStatus.time).getTime()) / 1000 / 60);
          if (diffMs >= 5) {
            this.caseService.getCases({ last_update_date: downloadStatus.time }, 1).subscribe(async (response: any) => {
              if (response) {
                await this.databaseService.setCases(response.data, response.linked);
                this.caseService.getFilterMasterData().subscribe(async (data: any) => {
                  await this.databaseService.setFilterMasterData(data.data);
                });
                await this.databaseService.setDownloadStatus({
                  status: true,
                  time: moment().format('YYYY-MM-DD hh:mm:ss')
                });
              }
            });
          }
        }
      }
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
    localStorage.removeItem('remote_token');
    localStorage.removeItem('userdata');
    await this.storageService.clearAll();
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
      this.databaseService.getUnsyncVisitForms().then(async (data) => {
        if (data) {
          let currentFormData;
          for (let i = 0; i < data.rows.length; i++) {
            currentFormData = data.rows.item(i);
            currentFormData.form_data = JSON.parse(decodeURI(currentFormData.form_data));
            this.visitService.saveForm(currentFormData.form_data).subscribe(async (res: any) => {
              await this.databaseService.updateVisitForm(1, res.data.id, currentFormData.id);
            });
          }
          await this.storageService.set('isVisitFormSync', true);
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
