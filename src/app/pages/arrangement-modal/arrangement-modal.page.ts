import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

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
  arrangementObj = {};
  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private router: Router,
    navParams: NavParams
  ) {
    this.caseId = navParams.get('caseId');
    this.outstanding = navParams.get('d_outstanding');
  }

  ngOnInit() {
    this.initForm();
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
      ref_amount: ['', [Validators.required]],
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
        start: this.arrangementForm.value.start,
        different_first_payment: this.arrangementForm.value.differentFirstPayment,
        first_amount: this.arrangementForm.value.firstPaymentAmount,
        first_date: this.arrangementForm.value.firstPaymentDate,
        note: this.arrangementForm.value.note
      };
      this.modalCtrl.dismiss({
        saved: true,
        arrangementObj: this.arrangementObj
      });
    } else {
      this.arrangementObj = {};
    }
  }

}
