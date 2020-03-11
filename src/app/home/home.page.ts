import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService, CaseService } from '../services';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  logo;
  cases = [];

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private databaseService: DatabaseService,
    private caseService: CaseService
  ) { }

  ngOnInit() {
    this.logo = localStorage.getItem('logo');
  }

  async ionViewDidEnter() {
    this.caseService.getCases({}).subscribe(async (response: any) => {
      await this.databaseService.setCases(response.data);
      const data = await this.databaseService.select('rdeb_cases');

      for (let i = 0; i < data.rows.length; i++) {
        this.cases.push(data.rows.item(i));
      }
      console.log('----this.cases----', this.cases);
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
}
