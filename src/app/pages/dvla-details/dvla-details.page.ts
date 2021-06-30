import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';
import { CaseDetailsService } from 'src/app/services/case-details.service';

@Component({
  selector: 'app-dvla-details',
  templateUrl: './dvla-details.page.html',
  styleUrls: ['./dvla-details.page.scss'],
})
export class DvlaDetailsPage implements OnInit {
  dvla;
  dvlaDetail: any = [];
  constructor(
    private modalCtrl: ModalController,
    private caseDetailsService: CaseDetailsService,
    private navParams: NavParams,
    private platform: Platform,
  ) {
    this.dvla = navParams.get('dvla');

  }

  ngOnInit() {
    this.getDvlaDetails();
  }
  getDvlaDetails() {
    this.caseDetailsService.getDvlaDetails(this.dvla.case_id, this.dvla.id).subscribe((res: any) => {
      this.dvlaDetail = res.prepare_array;
    });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }

}
