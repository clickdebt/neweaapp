import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';
import { CaseDetailsService } from 'src/app/services/case-details.service';
import { NetworkService } from 'src/app/services/network.service';
import { CaseActionService } from 'src/app/services/case-action.service';
import { StorageService, CommonService, DatabaseService } from 'src/app/services';
import * as moment from 'moment';
@Component({
  selector: 'app-authorize-card',
  templateUrl: './authorize-card.page.html',
  styleUrls: ['./authorize-card.page.scss'],
})
export class AuthorizeCardPage implements OnInit {

  addCardForm: FormGroup;
  caseId;
  debtorId;
  networkStatus;
  datemin = moment().format('YYYY-MM-DD');
  datemax = moment().add('100', 'years').format('YYYY-MM-DD');
  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private router: Router,
    navParams: NavParams,
    private commonService: CommonService,
    private networkService: NetworkService,
    private caseActionService: CaseActionService,
    private databaseService: DatabaseService,
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
    this.addCardForm = this.formBuilder.group({
      card_name: ['', [Validators.required]],
      card_number: ['', [Validators.required, Validators.pattern('^[0-9]{12,20}$')]],
      card_expiry: ['', [Validators.required]],
      card_cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      debtor_name: ['', [Validators.required]],
      address_ln1: ['', [Validators.required]],
      address_ln2: ['', []],
      post_code: ['', [Validators.required]],
      town: ['', [Validators.required]]
    });
  }
  async getDebtorData() {
    const data = await this.databaseService.getCaseInfo(this.caseId);
    if (data) {
      let currentCaseData = data;
      const debtorData = currentCaseData.debtor;
      this.addCardForm.patchValue({
        debtor_name: debtorData.debtor_name,
        address_ln1: debtorData.addresses[0].address_ln1,
        address_ln2: debtorData.addresses[0].address_ln2,
        post_code: debtorData.addresses[0].address_postcode,
        town: debtorData.addresses[0].address_town
      });
    }

  }
  save() {
    if (this.addCardForm.valid) {
      this.commonService.showLoader();
      const obj = {
        card_no: this.addCardForm.value.card_number,
        expiry_month: moment(this.addCardForm.value.card_expiry).format('MMYY'),
        cvc_no: this.addCardForm.value.card_cvc,
        card_name: this.addCardForm.value.card_name,
      };

      this.caseActionService.authorizeCard(obj).subscribe((res: any) => {
        console.log(res);
        if (res.success == true) {
          // save card details
          const data = {
            debtor_id: this.debtorId,
            card_identifier: res.card_identifier,
            payment_gateway: 'sagePay',
            sessionKey: res.sessionKey,
            card_type: '',
            debtor_name: this.addCardForm.value.debtor_name,
            address_ln1: this.addCardForm.value.address_ln1,
            address_ln2: this.addCardForm.value.address_ln2,
            post_code: this.addCardForm.value.post_code,
            town: this.addCardForm.value.town,
          };
          console.log(data);
          this.caseActionService.saveCardDetails(data).subscribe((response: any) => {
            console.log(response);
            this.commonService.dismissLoader();
            if (response.status == 'success') {
              this.commonService.showToast('card added successfully.');
            } else {
              if(Array.isArray(response.errors) && response.errors.length > 0){
                (response.errors).forEach(element => {
                  let msg = element.description;
                  if(element.property)
                    msg += ' (' + element.property + ')';
                  this.commonService.showToast(msg, 'danger');  
                });
              } else if(response.result.statusDetail) {
                this.commonService.showToast(response.result.statusDetail, 'danger');
              } else {
                this.commonService.showToast(response.status, 'danger');
              }
              // this.commonService.showToast(response.errors ? response.errors : response.result.statusDetail);
            }
          });
        } else {
          this.commonService.dismissLoader();
          if (res.message) {
            this.commonService.showToast(res.message);
          } else {
            (res.data.errors).forEach(element => {
              this.commonService.showToast(element.description);
            });
          }
        }
      });
    }
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
