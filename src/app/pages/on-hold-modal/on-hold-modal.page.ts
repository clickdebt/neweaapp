import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CaseActionService } from 'src/app/services/case-action.service';
import { CommonService } from 'src/app/services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-on-hold-modal',
  templateUrl: './on-hold-modal.page.html',
  styleUrls: ['./on-hold-modal.page.scss'],
})
export class OnHoldModalPage implements OnInit {
  @Input() caseId;
  @Input() caseMarker;
  @Input() case;
  holdForm: FormGroup;
  constructor(
    private modalCtrl: ModalController,
    private caseActionService: CaseActionService,
    private commonService: CommonService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    console.log(this.case);

    this.initForm();
  }

  initForm() {
    if (this.caseMarker.value === '1') {
      this.holdForm = this.formBuilder.group({
        note: ['', []],
      });
    } else {
      this.holdForm = this.formBuilder.group({
        hold_client_request: [false, [Validators.required]],
        no_of_days: ['', [Validators.required]],
        note: ['', []],
      });
    }
  }

  save() {
    console.log(this.holdForm.value);
    this.caseActionService.saveOnHoldStatus(this.holdForm.value, this.caseId).subscribe((response: any) => {
      console.log(response);
      this.commonService.showToast(response.data.message, 'success');
      this.modalCtrl.dismiss({
        saved: true,
        data: this.holdForm.value
      });
    });
  }
  removeHold() {
    console.log(this.holdForm.value);
    this.caseActionService.removeHoldStatus(this.holdForm.value, this.caseId).subscribe((response: any) => {
      this.commonService.showToast('Hold removed successfully', 'success');
      this.modalCtrl.dismiss({
        saved: true,
        data: this.holdForm.value
      });
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
