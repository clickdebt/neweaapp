import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CaseDetailsService } from 'src/app/services/case-details.service';

@Component({
  selector: 'app-view-payments',
  templateUrl: './view-payments.page.html',
  styleUrls: ['./view-payments.page.scss'],
})
export class ViewPaymentsPage implements OnInit {
  caseId;
  payments = [];
  constructor(
    private modalCtrl: ModalController,
    private caseDetailsService: CaseDetailsService,
    private navParams: NavParams
  ) {
    this.caseId = navParams.get('caseId');
   }

  ngOnInit() {
    this.getPayments();
  }
  getPayments () {
    this.caseDetailsService.getPayments(this.caseId).subscribe((res: any) => {
      this.payments = res.payment_data;
    });
  }
  dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }

}
