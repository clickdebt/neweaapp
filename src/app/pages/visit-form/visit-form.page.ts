import { Component, OnInit, ViewChild } from '@angular/core';
import { VisitService, CaseService, DatabaseService } from 'src/app/services';
import { StorageService } from 'src/app/services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/services';
import { PaymentModalPage } from '../payment-modal/payment-modal.page';
import { ArrangementModalPage } from '../arrangement-modal/arrangement-modal.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as moment from 'moment';
import { NetworkService } from 'src/app/services/network.service';
@Component({
  selector: 'app-visit-form',
  templateUrl: './visit-form.page.html',
  styleUrls: ['./visit-form.page.scss'],
})
export class VisitFormPage implements OnInit {

  formData;
  formConfig;
  jsonObject: any;
  jsonString: any;
  resultobj: any;
  addressData;
  caseId;
  visitedPageArr = [];
  modalDataObj: any;
  modalDataArr: any;
  paymentInfo;
  arrangementInfo;
  visitCaseData;
  caseAlerts;
  currLang: any;
  currLat: any;
  constructor(
    private visitService: VisitService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private caseService: CaseService,
    private modalCtrl: ModalController,
    private router: Router,
    private geolocation: Geolocation,
    private commonService: CommonService,
    private databaseService: DatabaseService,
    private networkService: NetworkService
  ) { }

  ngOnInit() {
    this.formConfig = {
      options: {
        alerts: {
          submitMessage: 'Thank you for submitting the form.'
        },
        errors: {
          message: 'Error while submitting the form. Please try again.'
        }
      }
    };
  }

  async ionViewWillEnter() {
    this.caseId = this.route.snapshot.params.id;
    this.getLocation();
    this.visitCaseData = JSON.parse(localStorage.getItem('visit_case_data'))
    if (this.visitCaseData) {
      this.addressData = {
        address_ln1: this.visitCaseData.debtor.addresses[0].address_ln1,
        address_ln2: this.visitCaseData.debtor.addresses[0].address_ln2,
        address_ln3: this.visitCaseData.debtor.addresses[0].address_ln3,
        address_town: this.visitCaseData.debtor.addresses[0].address_town,
        address_postcode: this.visitCaseData.debtor.addresses[0].address_postcode,
      };
    }
    this.visitService.getVisitForm().subscribe(res => {
      this.caseService.getVisitOutcomes(this.caseId).subscribe(response => {
        this.addVisitOutcomeField(response['data'], res);
      }, err => {
        console.log(err);
      });
    }, err => {
      console.log(err);
    });
  }
  dataRead(obj) {
    this.formData = obj.data[0];
    this.jsonString = obj.data[0].content;
    const re = /\{{([^}}]+)\}/g;
    const variables = this.jsonString.match(re);

    if (variables && variables.length > 0) {
      variables.forEach(variable => {
        let fieldkeyArr = variable.split('{{');
        fieldkeyArr = fieldkeyArr[1].split('}');
        const fieldKey = fieldkeyArr[0];
        if (this.addressData.hasOwnProperty(fieldKey)) {
          this.jsonString = this.jsonString.replace('{{' + fieldKey + '}}', this.addressData[fieldKey]);
        }
      });
      this.jsonString = this.jsonString.replace('{{x,y}}', this.currLat + ' , ' + this.currLang);
    }
    this.jsonObject = JSON.parse(this.jsonString);
    const visitOutcomeObj = {
      type: 'select',
      label: 'Visit Outcome',
      key: 'visit_outcome',
      placeholder: 'Select Visit Outcome',
      data: this.resultobj,
      dataSrc: 'values',
      template: '<span>{{ item.label }}</span>',
      input: true
    };
    const ComponentLength = this.jsonObject.components.length;
    this.jsonObject.components[ComponentLength - 1].components.push(visitOutcomeObj);
    // console.log(this.jsonObject);
  }

  addVisitOutcomeField(result, res) {
    const resData = [];
    this.caseAlerts = result;
    result.forEach(element => {
      const opt = {
        value: element.id,
        label: element.name
      };
      resData.push(opt);
    });
    this.resultobj = {
      values: resData
    };
    this.dataRead(res);
  }

  async getLocation() {
    const { coords } = await this.geolocation.getCurrentPosition();
    this.currLang = coords.longitude;
    this.currLat = coords.latitude;

  }
  onRender(event) {
    // console.log(event);
  }
  onNext(event) {
    // console.log(event);
    // if (localStorage.getItem('visited')) {
    //   localStorage.setItem('visited', Math.max(localStorage.getItem('visited'), event.page));
    // } else {
    //   localStorage.setItem('visited', event.page);
    // }
  }
  async onChange(event) {
    if (event.type === 'change' && event.srcElement.name.includes('data[singlePaymentMade]')) {
      if (event.srcElement.defaultValue == 1) {
        const paymodalPage = await this.modalCtrl.create({
          component: PaymentModalPage, componentProps: { 'cssClass': 'case-action-modal', 'caseId': this.caseId }
        });
        try {
          await paymodalPage.present();
          localStorage.setItem('isFormPage', 'true');
        } catch (error) {
          this.commonService.showToast('Modal Not Found');
        }

        const { data } = await paymodalPage.onWillDismiss();
        if (data && data.saved) {
          this.paymentInfo = data.paymentObj;
        }

      }
    } else if (event.type === 'change' && event.srcElement.name.includes('data[arrangementAgreed]')) {
      if (event.srcElement.defaultValue == 1) {

        const arrmodalPage = await this.modalCtrl.create({
          component: ArrangementModalPage, componentProps: {
            'cssClass': 'case-action-modal', 'caseId': this.caseId, 'outstanding': this.visitCaseData.d_outstanding
          }
        });
        try {
          await arrmodalPage.present();
          localStorage.setItem('isFormPage', 'true');
        } catch (error) {
          this.commonService.showToast('Modal Not Found');
        }

        const { data } = await arrmodalPage.onWillDismiss();
        if (data && data.saved) {
          this.arrangementInfo = data.arrangementObj;
        }
      }
    }
  }
  onSubmit(event) {
    // console.log(event, event.data);
    // console.log(this.paymentInfo);
    // console.log(this.arrangementInfo);
    // tslint:disable: triple-equals
    if (this.paymentInfo == undefined) {
      event.data.singlePaymentMade = 0;
    }
    if (this.arrangementInfo == undefined) {
      event.data.arrangementAgreed = 0;
    }

    if (event.data.visit_outcome != undefined && event.data.visit_outcome != '') {
      // tslint:disable: variable-name
      const visit_outcome = this.caseAlerts.find(ca => ca.id == event.data.visit_outcome);
      console.log(visit_outcome);
      event.data.visit_outcome = visit_outcome.name;
    }

    const visit_report_data = {
      form_data: event.data,
      payment_data: this.paymentInfo,
      arrangement_data: this.arrangementInfo
    };

    const form_data = {
      form_id: this.formData.id,
      case_id: this.caseId,
      status: 1,
      form_values: visit_report_data
    };
    console.log(form_data);
    let visitFormData = [
      { name: 'case_id', value: this.caseId },
      { name: 'form_data', value: form_data },
      { name: 'created_at', value: moment().format('YYYY-MM-DD hh:mm:ss') },
    ];
    if (this.networkService.getCurrentNetworkStatus() == 1) {
      this.visitService.saveForm(form_data).subscribe((res: any) => {
        visitFormData.push({ name: 'is_sync', value: 1 });
        visitFormData.push({ name: 'visit_form_data_id', value: res.data.id });
        this.databaseService.insert('visit_reports', visitFormData);
        this.commonService.showToast('Data Saved Successfully.');
        this.router.navigate(['/home/job-list']);
      }, () => {
        this.commonService.showToast('Something went wrong.');
      });
    } else {
      visitFormData.push({ name: 'is_sync', value: 0 });
      this.databaseService.insert('visit_reports', visitFormData);
      this.commonService.showToast('Data Saved Locally.');
      this.router.navigate(['/home/job-list']);
    }
  }
}
