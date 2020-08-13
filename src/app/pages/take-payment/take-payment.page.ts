import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';
import { CaseDetailsService } from 'src/app/services/case-details.service';
import { NetworkService } from 'src/app/services/network.service';
import { CaseActionService } from 'src/app/services/case-action.service';
import { StorageService, CommonService } from 'src/app/services';
import * as moment from 'moment';
@Component({
  selector: 'app-take-payment',
  templateUrl: './take-payment.page.html',
  styleUrls: ['./take-payment.page.scss'],
})
export class TakePaymentPage implements OnInit {

  paymentsForm: FormGroup;
  caseId;
  debtorId;
  networkStatus;
  datemin = moment().format('YYYY-MM-DD');
  datemax = moment().add('100', 'years').format('YYYY-MM-DD');
  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private router: Router,
    private navParams: NavParams,
    private commonService: CommonService,
    private caseDetailsService: CaseDetailsService,
    private networkService: NetworkService,
    private caseActionService: CaseActionService,
    private storageService: StorageService
  ) {
    this.caseId = navParams.get('caseId');
    this.debtorId = navParams.get('debtorId');
  }

  ngOnInit() {
    this.initForm();
  }
  async ionViewWillEnter() {
    this.networkStatus = await this.networkService.getCurrentNetworkStatus();
    this.getDebtorData();
  }
  initForm() {
    this.paymentsForm = this.formBuilder.group({
      date: [new Date().toISOString(), [Validators.required]],
      amount: ['', [Validators.required]],
      reference: [''],
      card_name: ['', [Validators.required]],
      card_number: ['', [Validators.required, Validators.pattern('^[0-9]{12,20}$')]],
      card_expiry: ['', [Validators.required]],
      card_cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      method: ['1'],
      source: ['1'],
      note: ['', []],
      financial_split_override_id: ['-1'],
      client_direct: ['0'],
      debtor_name: ['', [Validators.required]],
      address_ln1: ['', [Validators.required]],
      address_ln2: ['', []],
      post_code: ['', [Validators.required]],
      town: ['', [Validators.required]]
    });
  }
  getDebtorData() {
    this.caseDetailsService.getDebtordata(this.caseId, this.debtorId).subscribe((res: any) => {
      if (res) {
        const debtorData = res.data.data.debtor_details[0];
        console.log(debtorData);
        this.paymentsForm.patchValue({
          debtor_name: debtorData.debtor_name,
          address_ln1: debtorData.addresses[0].address_ln1,
          address_ln2: debtorData.addresses[0].address_ln2,
          post_code: debtorData.addresses[0].address_postcode,
          town: debtorData.addresses[0].address_town
        });

      }
    });
  }
  save() {
    if (this.paymentsForm.valid) {
      const obj = {
        case_id: this.caseId,
        // debtor_id: this.caseList[0].debtor_id,
        amount: this.paymentsForm.value.amount,
        card_no: this.paymentsForm.value.card_number,
        expiry_month: moment(this.paymentsForm.value.card_expiry).format('MMYY'),
        cvc_no: this.paymentsForm.value.card_cvc,
        card_name: this.paymentsForm.value.card_name,
        debtor_name: this.paymentsForm.value.debtor_name,
        address: (this.paymentsForm.value.address_ln1).concat(this.paymentsForm.value.address_ln2),
        post_code: this.paymentsForm.value.post_code,
        town: this.paymentsForm.value.town
      };
      console.log(obj);
      this.caseActionService.takePayment(obj).subscribe((res: any) => {
        console.log(res);
        if (res.status == 'Invalid') {
          this.commonService.showToast(res.statusDetail);
        } else {
          this.addPayment(res);
        }
      });
    }

  }
  addPayment(res) {
    const date = new Date().toISOString();
    const obj = {
      created_by: this.debtorId,
      created_at: date,
      updated_by: date,
      updated_at: date,
      case_id: this.caseId,
      sent: 1,
      sent_at: date,
      transaction_ref: res.transactionId,
      status: 'submitted',
      net_amount: res.amount.totalAmount,
      surcharge_amount: res.amount.surchargeAmount,
      is_card: 1,
      card_type: res.paymentMethod.card.cardType,
      card_auth_no: res.paymentMethod.card.cardIdentifier,
      gateway_configuration: 'sage',
      gateway_status: res.bankAuthorisationCode
    };
    this.caseActionService.addPayment(obj, this.caseId).subscribe((response: any) => {
      console.log(res);
      this.storageService.set('is_case_updated', true);
      this.commonService.showToast(res.message);
      if (res.success) {
        this.paymentsForm.reset();
        this.dismiss();
      }
    });

  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      saved: false
    });
  }
  toggleShow(object) {
    object.show = !object.show;
  }
  isShown(object) {
    return object.show;
  }
}
