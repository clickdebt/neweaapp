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
  }
  initForm() {
    this.addCardForm = this.formBuilder.group({
      card_name: ['', [Validators.required]],
      card_number: ['', [Validators.required, Validators.pattern('^[0-9]{12,20}$')]],
      card_expiry: ['', [Validators.required]],
      card_cvc: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
    });
  }
  save() {
    if (this.addCardForm.valid) {
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
            card_type: ''
          };
          console.log(data);
          this.caseActionService.saveCardDetails(data).subscribe((response: any) => {
            console.log(response);
            if (response.status == 'success') {
              this.commonService.showToast('card added successfully.');
            } else {
              this.commonService.showToast(response.errors ? response.errors : response.result.statusDetail);
            }
          });
        } else {
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
