import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService, CaseService, VisitService, StorageService } from '../services';
import { PanicModalPage } from '../pages/panic-modal/panic-modal.page'
import { forkJoin } from 'rxjs';
import { NetworkService } from '../services/network.service';
import * as moment from 'moment';

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

  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private router: Router,
    private databaseService: DatabaseService,
    private caseService: CaseService,
    private modalCtrl: ModalController,
    private visitService: VisitService,
    private networkService: NetworkService,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.logo = localStorage.getItem('logo');
    this.syncOfflineVisitForm();
  }

  ionViewWillEnter() {
    this.server_url = localStorage.getItem('server_url');
    this.username = JSON.parse(localStorage.getItem('userdata')).name;
  }
  async ionViewDidEnter() {
    if ((this.platform.is('android') || this.platform.is('ios'))
      && this.networkService.getCurrentNetworkStatus() === 1) {
      const downloadStatus = await this.databaseService.getDownloadStatus();
      if (!downloadStatus || !downloadStatus.status) {
        forkJoin({
          cases: this.caseService.getCases({}, 1),
          visitForm: this.visitService.getVisitForm(),
          filterMasterData: this.caseService.getFilterMasterData()
        }).subscribe(async (response: any) => {
          await this.databaseService.setCases(response.cases.data);
          await this.databaseService.setVisitForm(response.visitFormdata);
          await this.databaseService.setFilterMasterData(response.filterMasterData.data);
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
              await this.databaseService.setCases(response.data);
              await this.databaseService.setDownloadStatus({
                status: true,
                time: moment().format('YYYY-MM-DD hh:mm:ss')
              });
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

  logout() {
    localStorage.removeItem('remote_token');
    localStorage.removeItem('userdata');
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
        this.databaseService.getUnsyncVisitForms().then((data) => {
          if (data) {
            let currentFormData;
            for (let i = 0; i < data.rows.length; i++) {
              currentFormData = data.rows.item(i);
              this.visitService.saveForm(currentFormData).subscribe(async (res: any) => {
                await this.databaseService.updateVisitForm(1, res.data.id, currentFormData.id);
              });
            }
          }
        });
      }
    });
  }
}
