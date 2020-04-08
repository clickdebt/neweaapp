import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseActionService } from 'src/app/services/case-action.service';
import { AddNoteModalPage } from '../add-note-modal/add-note-modal.page';
import { UpdateArrangementModalPage } from '../update-arrangement-modal/update-arrangement-modal.page';
import { NetworkService } from 'src/app/services/network.service';
import * as moment from 'moment';
@Component({
  selector: 'app-arrangement-modal',
  templateUrl: './arrangement-modal.page.html',
  styleUrls: ['./arrangement-modal.page.scss'],
})
export class ArrangementModalPage implements OnInit {
  caseId = '';
  outstanding;
  arrangementForm: FormGroup;
  frequency = [{ id: '2', label: 'One time final payment' }, { id: '3', label: 'Weekly By day of the week' }, { id: '4', label: 'Monthly by date' }, { id: '5', label: 'Monthly by day' }, { id: '6', label: 'Fortnightly' }, { id: '7', label: '4 weekly' }];
  payment_methods = [{ id: 1, label: 'Cash' }, { id: 2, label: 'Cheque' }, { id: 4, label: 'Credit card' }, { id: 5, label: 'Debit Card' }, { id: 8, label: 'BACS' }];
  arrangementObj: any = { show: false };
  currentArrangementString = '';
  currArrangement;
  arrangementMode = 'make';
  activeArrangements: any = {
    currentArrangements: {
      show: true
    },
    scheduleArrangements: {
      show: false
    }
  };
  inActiveArrangements: any = {
    show: false
  };
  frequencies;
  updatedIndex = -1;
  networkStatus;
  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private router: Router,
    navParams: NavParams,
    private caseActionService: CaseActionService,
    private networkService: NetworkService
  ) {
    this.caseId = navParams.get('caseId');
    this.outstanding = navParams.get('d_outstanding');
  }

  ngOnInit() {
    this.initForm();

  }
  async ionViewWillEnter() {
    this.networkStatus = await this.networkService.getCurrentNetworkStatus();
    if (this.networkStatus) {
      this.getActiveArrangements();
      this.getInactiveArrangements();
    } else {
      this.arrangementObj.show = true;
    }
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      saved: false
    });
  }
  initForm() {
    this.arrangementForm = this.formBuilder.group({
      frequency: ['2', [Validators.required]],
      amount: ['', [Validators.required]],
      ref_amount: [this.outstanding, [Validators.required]],
      method: ['1', [Validators.required]],
      start: ['', [Validators.required]],
      note: ['', []],
      differentFirstPayment: [false, []],
      firstPaymentAmount: [''],
      firstPaymentDate: ['']
    });
  }
  save() {
    if (this.arrangementForm.valid) {
      this.arrangementObj = {
        freq: this.arrangementForm.value.frequency,
        amount: this.arrangementForm.value.amount,
        ref_amount: this.arrangementForm.value.ref_amount,
        method: this.arrangementForm.value.method,
        source: this.arrangementForm.value.source,
        start: moment(this.arrangementForm.value.start).format('DD-MM-YYYY'),
        different_first_payment: this.arrangementForm.value.differentFirstPayment,
        first_amount: this.arrangementForm.value.firstPaymentAmount,
        first_date: this.arrangementForm.value.firstPaymentDate ? moment(this.arrangementForm.value.firstPaymentDate).format('DD-MM-YYYY') : "",
        note: this.arrangementForm.value.note,
        mode: this.arrangementMode
      };
      this.modalCtrl.dismiss({
        saved: true,
        arrangementObj: this.arrangementObj
      });
    } else {
      this.arrangementObj = {};
    }
  }
  toggleShow(object) {
    object.show = !object.show;
  }
  isShown(object) {
    return object.show;
  }
  getActiveArrangements() {
    this.caseActionService.getActiveArrangements(this.caseId).subscribe((response: any) => {
      this.currArrangement = Object.values(response.current_arrangement);
      this.currArrangement = this.currArrangement.find(data => data.active == 1);
      this.makeCurrentArrangementString();
      if (this.currArrangement) {
        this.arrangementMode = 'archive_make';
        this.activeArrangements.scheduleArrangements.data = Object.values(response.arrangement_schedule).reverse();
      }
    });
  }
  makeCurrentArrangementString() {
    if (this.currArrangement) {
      this.currentArrangementString += `The defendant agreed to pay `;
      if (parseInt(this.currArrangement.first_amount, 10) > 0 && this.currArrangement.first_date) {
        this.currentArrangementString += `initial payment of <strong>&pound;${this.currArrangement.first_amount}
        </strong> due on <strong>${moment(this.currArrangement.first_date).format('DD-MM-YYYY')}</strong> followed by `;
      }
      this.currentArrangementString += `<strong>&pound;${this.currArrangement.amount}</strong> with a <strong>
      ${this.frequencies[this.currArrangement.freq]}</strong> on <strong>
      ${moment(this.currArrangement.start).format('DD-MM-YYYY')}</strong>.</p > `;
    } else {
      this.currentArrangementString += `The case ${this.caseId} has no arrangement set.`;
    }
  }
  getInactiveArrangements() {
    this.caseActionService.getInactiveArrangements(this.caseId).subscribe((response: any) => {
      this.inActiveArrangements.data = response.data.data;
      this.frequencies = response.data.frequencies;
      console.log(this.frequencies);
      
    });
  }
  async update(arrangement, index) {
    const updateArrangement = await this.modalCtrl.create({
      component: UpdateArrangementModalPage,
      componentProps: {
        caseId: this.caseId,
        scheduleArrangement: arrangement
      }
    });
    updateArrangement.onDidDismiss()
      .then((response) => {
        this.activeArrangements.scheduleArrangements.data[index] = response.data;
      });
    await updateArrangement.present();

  }
}
