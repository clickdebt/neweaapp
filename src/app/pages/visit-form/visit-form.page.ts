import { Component, OnInit, ViewChild } from '@angular/core';
import { VisitService, CaseService } from 'src/app/services';
import { StorageService } from 'src/app/services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/services';
import { PaymentModalPage } from '../payment-modal/payment-modal.page';
import { ArrangementModalPage } from '../arrangement-modal/arrangement-modal.page';
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
  lat: string;
  lang: string;
  resultobj: any;
  addressData;
  caseId;
  visitedPageArr = [];
  modalDataObj: any;
  modalDataArr: any;
  constructor(
    private visitService: VisitService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private caseService: CaseService,
    private modalCtrl: ModalController,
    private router: Router,
    private commonService: CommonService
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
    const casesData = await this.storageService.get('cases');
    const visitCaseData = casesData.find(c => c.id == this.caseId);
    this.addressData = {
      address_ln1: visitCaseData.debtor.addresses[0].address_ln1,
      address_ln2: visitCaseData.debtor.addresses[0].address_ln2,
      address_ln3: visitCaseData.debtor.addresses[0].address_ln3,
      address_town: visitCaseData.debtor.addresses[0].address_town,
      address_postcode: visitCaseData.debtor.addresses[0].address_postcode,
    };
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
    const tempObj = {
      id: 1,
      form_name: 'Visit Form',
      content: obj.data[0].content,
      client_id: 1,
      scheme_cat_id: 1
    };
    this.jsonString = tempObj.content;
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
      this.jsonString = this.jsonString.replace('{{x,y}}', this.lat + ' , ' + this.lang);
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
    result.forEach(element => {
      const opt = {
        value: element.id + '@@@' + element.alert_cal_id + '|' + element.name,
        label: element.name
      };
      resData.push(opt);
    });
    this.resultobj = {
      values: resData
    };
    this.dataRead(res);
  }
  getLocation() {
    // get lat long
  }
  onRender(event) {
    console.log(event);
  }
  onNext(event) {
    console.log(event);
  }
  async onChange(event) {
    if (event.type === 'change' && event.srcElement.name.includes('data[singlePaymentMade]')) {
      if (event.srcElement.defaultValue == 1) {
        const paymodalPage = await this.modalCtrl.create({
          component: PaymentModalPage, componentProps: { cssClass: 'case-action-modal' }
        });
        try {
          await paymodalPage.present();
          localStorage.setItem('isFormPage', 'true');
        } catch (error) {
          this.commonService.showToast('Modal Not Found');
        }

        const { data } = await paymodalPage.onWillDismiss();
        if (data) {
          console.log(data);
        }

      }
    } else if (event.type === 'change' && event.srcElement.name.includes('data[arrangementAgreed]')) {
      if (event.srcElement.defaultValue === 1) {


        let arrmodalPage = await this.modalCtrl.create({
          component: ArrangementModalPage, componentProps: { cssClass: 'case-action-modal', outstanding: 0 }
        });
        try {
          await arrmodalPage.present();
          localStorage.setItem('isFormPage', 'true');
        } catch (error) {
          this.commonService.showToast('Modal Not Found');
        }

        const { data } = await arrmodalPage.onWillDismiss();
        if (data) {
          console.log(data);
        }
      }
    }
  }
  onSubmit(event) {

  }
}
