import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';
import { CaseDetailsService } from 'src/app/services/case-details.service';
import { DvlaDetailsPage } from '../dvla-details/dvla-details.page';

@Component({
  selector: 'app-dvla',
  templateUrl: './dvla.page.html',
  styleUrls: ['./dvla.page.scss'],
})
export class DvlaPage implements OnInit {
  caseData;
  dvlaList: any = [];
  status = [
    'pending',
    'requested',
    'received',
    'cancelled',
    'deleted',
  ];
  isMobile = false;
  constructor(
    private modalCtrl: ModalController,
    private caseDetailsService: CaseDetailsService,
    private navParams: NavParams,
    private platform: Platform,
  ) {
    this.caseData = navParams.get('caseData');
    console.log(this.caseData);

  }

  ngOnInit() {
    this.isMobile = this.platform.is('mobile');
    this.getDvlaEnquires();
  }
  getDvlaEnquires() {
    this.caseDetailsService.getDvlaEnquires(this.caseData.custom5).subscribe((res: any) => {
      this.dvlaList = Object.values(res);
    });
  }
  async goToDvlaDetails(dvla) {
    const dvlaDetailsModal = await this.modalCtrl.create({
      component: DvlaDetailsPage,
      componentProps: {
        dvla: dvla
      }
    });

    await dvlaDetailsModal.present();
  }
  dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }
}
