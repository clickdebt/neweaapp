import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService, CaseService } from '../services';
import { PanicModalPage } from '../pages/panic-modal/panic-modal.page'
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
    private alertCtrl: AlertController,
    private router: Router,
    private databaseService: DatabaseService,
    private caseService: CaseService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.logo = localStorage.getItem('logo');
  }

  ionViewWillEnter() {
    this.server_url = localStorage.getItem('server_url');
    this.username = JSON.parse(localStorage.getItem('userdata')).name;
  }
  async ionViewDidEnter() {
    this.caseService.getCases({}).subscribe(async (response: any) => {
      await this.databaseService.setCases(response.data);
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

}
