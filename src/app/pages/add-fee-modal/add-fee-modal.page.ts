import { Component, OnInit, Input } from '@angular/core';
import { CaseActionService } from 'src/app/services/case-action.service';
import { NavParams, ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/services';

@Component({
  selector: 'app-add-fee-modal',
  templateUrl: './add-fee-modal.page.html',
  styleUrls: ['./add-fee-modal.page.scss'],
})
export class AddFeeModalPage implements OnInit {
  @Input() caseId;
  feeOptions: any[];
  selectedFeeOption = '';
  feeActions: any[];
  constructor(
    private caseActionService: CaseActionService,
    private modalCtrl: ModalController,
    private commonService: CommonService) {
  }

  ngOnInit() {
    this.getFeeOptions();
    this.getFeeActions();
  }
  getFeeOptions() {
    this.caseActionService.getFeeOptions(this.caseId).subscribe((response: any) => {
      this.feeOptions = response.data.data;
    });
  }
  onSelectChange(event) {
    console.log(this.selectedFeeOption);
    if (this.selectedFeeOption) {
      const feeData = {
        fee_id: this.selectedFeeOption,
        amount: this.feeOptions[this.selectedFeeOption].amount
      };
      this.caseActionService.addFee(feeData, this.caseId).subscribe((response: any) => {
        this.getFeeActions();
        this.commonService.showToast(response.data.message, 'success');
        if (response.data.data.length) {
          this.feeOptions = response.data.data;
        }
      });
    }
  }
  getFeeActions() {
    this.caseActionService.getFeeActions(this.caseId).subscribe((response: any) => {
      this.feeActions = response.data.data;
    });
  }
  async dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }
  delete(feeActionId) {
    this.caseActionService.deleteFeeAction(feeActionId, this.caseId).subscribe((response: any) => {
      this.getFeeActions();
      this.commonService.showToast(response.data.message);
    });
  }
}
