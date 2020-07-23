import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseActionService } from 'src/app/services/case-action.service';
import { UpdateArrangementModalPage } from '../update-arrangement-modal/update-arrangement-modal.page';
import { NetworkService } from 'src/app/services/network.service';
import * as moment from 'moment';
import { CommonService, StorageService } from 'src/app/services';
import { CalendarModal, CalendarModalOptions } from 'ion2-calendar';

@Component({
  selector: 'app-arrangement-modal',
  templateUrl: './arrangement-modal.page.html',
  styleUrls: ['./arrangement-modal.page.scss'],
})
export class ArrangementModalPage implements OnInit {
  caseId = '';
  outstanding;
  arrangementForm: FormGroup;
  // tslint:disable: max-line-length
  frequency = [{ id: '2', label: 'One time final payment' }, { id: '3', label: 'Weekly By day of the week' }, { id: '4', label: 'Monthly by date' }, { id: '5', label: 'Monthly by day' }, { id: '6', label: 'Fortnightly' }, { id: '7', label: '4 weekly' }];
  paymentMethods = [{ id: 1, label: 'Cash' }, { id: 2, label: 'Cheque' }, { id: 4, label: 'Credit card' }, { id: 5, label: 'Debit Card' }, { id: 8, label: 'BACS' }];
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
  isDetailsPage;
  currentCase;
  isGroupArrangement = false;
  baseOutstanding;
  groupArrId;
  date;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private router: Router,
    private navParams: NavParams,
    private caseActionService: CaseActionService,
    private networkService: NetworkService,
    private commonService: CommonService,
    private storageService: StorageService,
  ) {
    this.caseId = navParams.get('caseId');
    this.baseOutstanding = this.outstanding = navParams.get('d_outstanding');
    this.isDetailsPage = navParams.get('isDetailsPage');
    this.currentCase = navParams.get('currentCase');
  }

  ngOnInit() {
    this.initForm();

  }
  async ionViewWillEnter() {
    this.networkStatus = await this.networkService.getCurrentNetworkStatus();
    if (this.networkStatus) {
      this.getActiveArrangements();
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
  async openCalendar(input) {
    console.log(input);
    this.date = input;
    const options: CalendarModalOptions = {
      title: '',
      canBackwardsSelected: true
    };
    const myCalendar = await this.modalCtrl.create({
      component: CalendarModal,
      componentProps: {
        options: options
      }
    });

    myCalendar.onDidDismiss()
      .then((response) => {
        console.log(this.date);
        const date = this.date;
        console.log(response);
        if (response.role == 'done') {
          this.arrangementForm.controls[date].patchValue(moment(response.data.dateObj).format('YYYY-MM-DD'), { onlySelf: true });
        }
      });
    await myCalendar.present();
  }
  initForm() {
    this.arrangementForm = this.formBuilder.group({
      selectedLinkCaseIds: [[], []],
      frequency: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      ref_amount: [this.outstanding, [Validators.required]],
      method: ['', [Validators.required]],
      start: ['', [Validators.required]],
      note: ['', []],
      differentFirstPayment: [false, []],
      firstPaymentAmount: [''],
      firstPaymentDate: ['']
    });
  }
  save() {
    if (this.arrangementForm.valid) {
      this.storageService.set('is_case_updated', true);
      this.arrangementObj = {
        freq: this.arrangementForm.value.frequency,
        amount: this.arrangementForm.value.amount,
        ref_amount: this.arrangementForm.value.ref_amount,
        method: this.arrangementForm.value.method,
        source: this.arrangementForm.value.source,
        start: moment(this.arrangementForm.value.start).format('YYYY-MM-DD'),
        different_first_payment: this.arrangementForm.value.differentFirstPayment,
        first_amount: this.arrangementForm.value.firstPaymentAmount,
        first_date: this.arrangementForm.value.firstPaymentDate ? moment(this.arrangementForm.value.firstPaymentDate).format('YYYY-MM-DD') : '',
        note: this.arrangementForm.value.note,
        mode: this.arrangementMode
      };
      let linkedCases = this.arrangementForm.value.selectedLinkCaseIds;
      let type = 'edit';
      if (linkedCases.length) {
        linkedCases.push(this.caseId);
        this.arrangementObj.cases = linkedCases;
        this.arrangementObj.is_group = 1;
        type = 'group_arrangement';
      }
      if (this.isDetailsPage === true) {
        this.caseActionService.createArrangement(this.arrangementObj, this.caseId, type)
          .subscribe((response: any) => {
            this.currArrangement = {};
            this.commonService.showToast(response.data.message, 'success');
            this.getActiveArrangements();
          });
      } else {
        this.modalCtrl.dismiss({
          saved: true,
          arrangementObj: this.arrangementObj
        });
      }
    } else {
      this.arrangementObj = {};
    }
  }
  differentFirstPaymentChanged(event) {
    if (event.detail.checked) {
      this.arrangementForm.controls["firstPaymentAmount"].setValidators([Validators.required]);
      this.arrangementForm.controls["firstPaymentDate"].setValidators([Validators.required]);
    } else {
      this.arrangementForm.controls["firstPaymentAmount"].setValidators([]);
      this.arrangementForm.controls["firstPaymentDate"].setValidators([]);
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

      if (this.currentCase.linked_cases && this.currArrangement == '' && response.group_arrangement) {
        this.groupArrId = response.group_arrangement.case_id;
        this.currArrangement = [response.group_arrangement];
        if (this.currArrangement) {
          this.isGroupArrangement = true;
        }
      }
      this.currArrangement = this.currArrangement.find(data => data.active == 1);
      this.getInactiveArrangements();
      if (this.currArrangement) {
        this.arrangementMode = 'archive_make';
        if (this.isGroupArrangement) {
          this.activeArrangements.scheduleArrangements.data = Object.values(response.group_schedules);
        } else {
          this.activeArrangements.scheduleArrangements.data = Object.values(response.arrangement_schedule).reverse();
        }
      }
    });
  }
  makeCurrentArrangementString() {
    this.currentArrangementString = '';
    if (this.currArrangement) {
      this.currentArrangementString += `The defendant agreed to pay `;
      if (parseInt(this.currArrangement.first_amount, 10) > 0 && this.currArrangement.first_date) {
        this.currentArrangementString += `initial payment of <strong>&pound;${this.currArrangement.first_amount}
        </strong> due on <strong>${moment(this.currArrangement.first_date).format('DD-MM-YYYY')}</strong> followed by `;
      }
      this.currentArrangementString += `<strong>&pound;${this.currArrangement.amount}</strong> with a <strong>
      ${this.frequencies[this.currArrangement.freq]}</strong> on <strong>
      ${moment(this.currArrangement.start).format('DD-MM-YYYY')}</strong>.</p>`;
      if (this.isGroupArrangement) {
        this.currentArrangementString += `<div>Selected Cases:  ${JSON.parse(this.currArrangement.caseids).join()}</div>`;
      }
    } else {
      this.currentArrangementString += `The case ${this.caseId} has no arrangement set.`;
    }
  }
  getInactiveArrangements() {
    this.caseActionService.getInactiveArrangements(this.caseId).subscribe((response: any) => {
      this.inActiveArrangements.data = response.data.data;
      this.frequencies = response.data.frequencies;
      let freqNew = [];
      if (this.frequencies) {
        Object.entries(this.frequencies).forEach((val) => {
          const obj = { id: val[0], label: val[1] };
          freqNew.push(obj);
        });
        this.frequency = freqNew;
      }
      this.makeCurrentArrangementString();
    });
  }
  async update(arrangement, index) {
    const updateArrangement = await this.modalCtrl.create({
      component: UpdateArrangementModalPage,
      componentProps: {
        caseId: this.isGroupArrangement ? this.groupArrId : this.caseId,
        scheduleArrangement: arrangement,
        isGroupArr: this.isGroupArrangement
      }
    });
    updateArrangement.onDidDismiss()
      .then((response) => {
        this.getActiveArrangements();
      });
    await updateArrangement.present();

  }
  onLinkCaseSelectChange(event) {
    const linked = this.currentCase.linked_cases.filter(lc => (this.arrangementForm.value.selectedLinkCaseIds).indexOf(lc.id) != -1);
    const linkedCasesTotalBalance = parseFloat(this.baseOutstanding) + linked.reduce((accumulator, currentValue) => {
      return accumulator + parseFloat(currentValue.d_outstanding);
    }, 0);
    this.outstanding = linkedCasesTotalBalance;
    this.arrangementForm.patchValue({ 'ref_amount': linkedCasesTotalBalance });

  }
}
