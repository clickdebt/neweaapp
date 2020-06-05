import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CaseActionService } from 'src/app/services/case-action.service';

@Component({
  selector: 'app-update-arrangement-modal',
  templateUrl: './update-arrangement-modal.page.html',
  styleUrls: ['./update-arrangement-modal.page.scss'],
})
export class UpdateArrangementModalPage implements OnInit {
  updateArrangementForm: FormGroup;
  scheduleArrangement;
  caseId;
  arrType;
  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private formBuilder: FormBuilder,
    private caseActionService: CaseActionService) { }

  ngOnInit() {
    this.initForm();
    this.caseId = this.navParams.get('caseId');
    this.scheduleArrangement = this.navParams.get('scheduleArrangement');
    this.arrType = this.navParams.get('isGroupArr') ? 'group' : 'single';
  }
  initForm() {
    this.updateArrangementForm = this.formBuilder.group({
      date: [this.scheduleArrangement.date, [Validators.required]],
      amount: [this.scheduleArrangement.amount, [Validators.required]],
    });
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      saved: false
    });
  }
  update() {
    if (this.updateArrangementForm.valid) {
      this.updateArrangementForm.value.date = moment(this.updateArrangementForm.value.date).format('YYYY-MM-DD');
      this.scheduleArrangement.date = this.updateArrangementForm.value.date;
      this.scheduleArrangement.amount = this.updateArrangementForm.value.amount;
      console.log(this.updateArrangementForm.value);

      this.caseActionService.updateArrangement(this.updateArrangementForm.value, this.caseId,
        this.scheduleArrangement.id, this.arrType).subscribe((response) => {
          console.log(response);

          this.modalCtrl.dismiss({
            saved: true,
            scheduleArrangement: this.scheduleArrangement
          });
        });
    }
  }
}
