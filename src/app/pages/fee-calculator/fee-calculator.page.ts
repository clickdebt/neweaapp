import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { DatabaseService } from 'src/app/services';

@Component({
  selector: 'app-fee-calculator',
  templateUrl: './fee-calculator.page.html',
  styleUrls: ['./fee-calculator.page.scss'],
})
export class FeeCalculatorPage implements OnInit {
  caseId;
  currentCaseData;
  fee_net = 0;
  fee_net_1: any = 0;
  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private databaseService: DatabaseService
  ) {
    this.caseId = navParams.get('caseId');
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.currentCaseData = await this.databaseService.getCaseInfo(this.caseId);
    this.calculateFee();
    console.log(this.currentCaseData);
    
  }
  calculateFee() {
    const totalAmount = this.getTotalOutstanding();
    if(totalAmount) {
      this.fee_net = 235;
      if(totalAmount > 1500) {
        this.fee_net_1 = ((totalAmount - 1500) * 0.075);
      }
    }
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }
  getTotalOutstanding() {
    return parseFloat(this.currentCaseData.d_outstanding) + parseFloat(this.currentCaseData.linkedCasesTotalBalance);
  }
}
