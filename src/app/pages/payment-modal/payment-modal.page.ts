import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseDetailsService } from 'src/app/services/case-details.service';
import { NetworkService } from 'src/app/services/network.service';
import { CaseActionService } from 'src/app/services/case-action.service';
import { StorageService } from 'src/app/services';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.page.html',
  styleUrls: ['./payment-modal.page.scss'],
})
export class PaymentModalPage implements OnInit {

  caseId: string;
  paymentsForm: FormGroup;
  submitted: false;
  paymentObj: any = {
    show: false
  };
  // tslint:disable: max-line-length
  payment_methods = [{ id: 1, label: 'Cash' }, { id: 2, label: 'Cheque' }, { id: 4, label: 'Credit card' }, { id: 5, label: 'Debit Card' }, { id: 8, label: 'BACS' }];
  sources = [{ id: 1, label: 'Post' }, { id: 3, label: 'Phone' }, { id: 5, label: 'Client direct' }, { id: 6, label: 'Online' }, { id: 7, label: 'Other' }, { id: 9, label: 'Officer' }, { id: 11, label: 'Bank Giro' }];
  splites = [{ id: '-1', label: '[DEF]Default' }, { id: 5, label: 'Client And Scheme' }, { id: 6, label: 'Client' }, { id: 7, label: 'Scheme' }, { id: 9, label: 'Global' }];
  payments: any = {
    show: false
  };
  isDetailsPage;
  networkStatus;
  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private router: Router,
    navParams: NavParams,
    private caseDetailsService: CaseDetailsService,
    private networkService: NetworkService,
    private caseActionService: CaseActionService,
    private storageService: StorageService
  ) {
    this.caseId = navParams.get('caseId');
    this.isDetailsPage = navParams.get('isDetailsPage');
  }

  ngOnInit() {
    this.initForm();
  }
  async ionViewWillEnter() {
    this.networkStatus = await this.networkService.getCurrentNetworkStatus();
    this.getPayments();
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
      this.storageService.set('is_case_updated', true);
      this.paymentObj = {
        date: this.paymentsForm.value.date,
        amount: this.paymentsForm.value.amount,
        reference: this.paymentsForm.value.reference,
        method: this.paymentsForm.value.method,
        source: this.paymentsForm.value.source,
        financial_split_override_id: this.paymentsForm.value.financial_split_override_id,
        payment_notes: this.paymentsForm.value.note
      };
      if (this.isDetailsPage) {
        console.log(this.paymentObj);
        // check once
        // this.caseActionService.createPayment(this.paymentObj, this.caseId).subscribe((response) => {
        //   console.log(response);
        // });
      } else {
        this.modalCtrl.dismiss({
          saved: true,
          paymentObj: this.paymentObj
        });
      }
    } else {
      this.paymentObj = {};
    }
  }
  toggleShow(object) {
    object.show = !object.show;
  }
  isShown(object) {
    return object.show;
  }
  getPayments() {
    this.caseDetailsService.getPayments(this.caseId).subscribe((response: any) => {
      this.payments.paymentData = response.payment_data;
      this.payments.paymentData.sort((a, b) => {
        if (new Date(a.date) > new Date(b.date)) {
          return -1;
        } else if (new Date(a.date) < new Date(b.date)) {
          return 1;
        }
        return 0;
      });
    });
  }

}
