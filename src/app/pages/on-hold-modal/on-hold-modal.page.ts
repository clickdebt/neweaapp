import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CaseActionService } from 'src/app/services/case-action.service';
import { CommonService } from 'src/app/services';

@Component({
  selector: 'app-on-hold-modal',
  templateUrl: './on-hold-modal.page.html',
  styleUrls: ['./on-hold-modal.page.scss'],
})
export class OnHoldModalPage implements OnInit {
  @Input() caseId;
  formData: any = {
    // date: new Date().toISOString()
  };
  constructor(
    private modalCtrl: ModalController,
    private caseActionService: CaseActionService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
  }
  onDaysChange(event) {
    this.formData.date = new Date(new Date().getTime() + (event.detail.value * 24 * 60 * 60 * 1000)).toISOString();
  }
  save() {
    this.formData.status_id = 3;
    console.log(this.formData);
    this.caseActionService.saveOnHoldStatus(this.formData, this.caseId).subscribe((response: any) => {
      this.commonService.showToast(response.data.message, 'success');
    });
  }
  cancel() {
    this.dismiss();
  }
  async dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }
}
