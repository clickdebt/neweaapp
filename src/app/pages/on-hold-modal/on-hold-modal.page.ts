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
  onHoldForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private caseActionService: CaseActionService,
    private commonService: CommonService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.onHoldForm = this.formBuilder.group({
      hold_client_request: [false, [Validators.required]],
      no_of_days: ['', [Validators.required]],
      note: ['', []],
    });
  }

  save() {
    console.log(this.onHoldForm.value);
    this.caseActionService.saveOnHoldStatus(this.onHoldForm.value, this.caseId).subscribe((response: any) => {
      console.log(response);
      this.commonService.showToast(response.data.message, 'success');
      this.modalCtrl.dismiss({
        saved: true
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
