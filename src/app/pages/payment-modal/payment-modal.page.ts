import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.page.html',
  styleUrls: ['./payment-modal.page.scss'],
})
export class PaymentModalPage implements OnInit {

  caseId: string;
  paymentsForm: FormGroup;
  submitted: false;
  paymentObj = {};
  // tslint:disable: max-line-length
  payment_methods = [{ id: 1, label: 'Cash' }, { id: 2, label: 'Cheque' }, { id: 4, label: 'Credit card' }, { id: 5, label: 'Debit Card' }, { id: 8, label: 'BACS' }];
  sources = [{ id: 1, label: 'Post' }, { id: 3, label: 'Phone' }, { id: 5, label: 'Client direct' }, { id: 6, label: 'Online' }, { id: 7, label: 'Other' }, { id: 9, label: 'Officer' }, { id: 11, label: 'Bank Giro' }];
  splites = [{ id: '-1', label: '[DEF]Default' }, { id: 5, label: 'Client And Scheme' }, { id: 6, label: 'Client' }, { id: 7, label: 'Scheme' }, { id: 9, label: 'Global' }];
  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private router: Router,
    navParams: NavParams
  ) {
    this.caseId = navParams.get('caseId');
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.paymentsForm = this.formBuilder.group({
      date: [new Date().toISOString(), [Validators.required]],
      amount: ['', [Validators.required]],
      reference: ['', [Validators.required]],
      method: ['1', [Validators.required]],
      source: ['1', [Validators.required]],
      note: ['', []],
      financial_split_override_id: ['-1'],
    });
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      saved: false
    });
  }
  save() {
    if (this.paymentsForm.valid) {
      this.paymentObj = {
        date: this.paymentsForm.value.date,
        amount: this.paymentsForm.value.amount,
        reference: this.paymentsForm.value.reference,
        method: this.paymentsForm.value.method,
        source: this.paymentsForm.value.source,
        financial_split_override_id: this.paymentsForm.value.financial_split_override_id,
        payment_notes: this.paymentsForm.value.note
      };
      this.modalCtrl.dismiss({
        saved: true,
        paymentObj: this.paymentObj
      });
    } else {
      this.paymentObj = {};
    }
  }

}
