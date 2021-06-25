import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';
import { CaseDetailsService } from 'src/app/services/case-details.service';

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
      console.log(res);

      this.dvlaList = Object.values(res);
    });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }
}
