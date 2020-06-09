import { Component, OnInit, ViewChild } from '@angular/core';
import { VisitService, CaseService, DatabaseService } from 'src/app/services';
import { StorageService } from 'src/app/services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';
import { CommonService } from 'src/app/services';
import { PaymentModalPage } from '../payment-modal/payment-modal.page';
import { ArrangementModalPage } from '../arrangement-modal/arrangement-modal.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as moment from 'moment';
declare var google;
import { NetworkService } from 'src/app/services/network.service';
@Component({
  selector: 'app-visit-form',
  templateUrl: './visit-form.page.html',
  styleUrls: ['./visit-form.page.scss'],
})
export class VisitFormPage implements OnInit {
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  circle = new google.maps.Circle();
  polygon = new google.maps.Polygon();
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
  visitOutcome;
  distance;
  locationOverride = false;
  tomiles = 1609.34;
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
    private networkService: NetworkService,
    private alertCtrl: AlertController
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
      if (this.visitCaseData.debtor.enforcement_addresses) {
        this.addressData = {
          address_ln1: this.visitCaseData.debtor.enforcement_addresses[0].address_ln1,
          address_ln2: this.visitCaseData.debtor.enforcement_addresses[0].address_ln2,
          address_ln3: this.visitCaseData.debtor.enforcement_addresses[0].address_ln3,
          address_town: this.visitCaseData.debtor.enforcement_addresses[0].address_town,
          address_postcode: this.visitCaseData.debtor.enforcement_addresses[0].address_postcode,
        };
        this.addressData.address_str = Object.values(this.addressData).join(',');
        this.getGeocodesLatLongs(this.addressData);
      }
    }
    if (this.networkService.getCurrentNetworkStatus() === 1) {
      this.visitService.getVisitForm().subscribe(res => {
        this.caseService.getVisitOutcomes(this.caseId).subscribe(response => {
          this.addVisitOutcomeField(response['data'], res);
        }, err => {
          console.log(err);
        });
      }, err => {
        console.log(err);
      });
    } else {
      const visitFrom: any = {};
      visitFrom.data = await this.storageService.get('visit_form');
      this.visitOutcome = await this.storageService.get('visitOutcomes');
      if (!this.visitOutcome) {
        this.visitOutcome = [];
      }
      this.addVisitOutcomeField(this.visitOutcome, visitFrom);
    }
  }
  getGeocodesLatLongs(obj) {
    this.caseService.geoCodeAddress(obj.address_str).subscribe((res: any) => {
      if (res.status === 'OK' && res.results && res.results[0]) {
        obj.location = res.results[0]['geometry']['location'];
        const source = new google.maps.LatLng(obj.location.lat, obj.location.lng);
        const destination = new google.maps.LatLng(this.currLat, this.currLang);
        this.distance = google.maps.geometry.spherical.computeDistanceBetween(source, destination);
        console.log(obj.location.lat, obj.location.lng, this.currLat, this.currLang, this.distance);
        if (this.distance > 200) {
          this.confirmLocation();
        }
      } else {
        this.commonService.showToast('Address not found');
        console.log(obj, res);
      }
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
    // const source = new google.maps.LatLng(-34, 151);
    // const destination = new google.maps.LatLng(-35, 151);
    // const distance = google.maps.geometry.spherical.computeDistanceBetween(source, destination);
    // console.log(distance);
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
        if (data) {
          localStorage.removeItem('isFormPage');
          if (data.saved) {
            this.paymentInfo = data.paymentObj;
          }
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
        if (data) {
          localStorage.removeItem('isFormPage');
          if (data.saved) {
            this.arrangementInfo = data.arrangementObj;
          }
        }
      }
    }
  }
  async confirmLocation() {
    const alert = await this.alertCtrl.create({
      header: 'Location issue',
      message: 'It is a business requirement that you are at property before starting a case visit.'
        + ' <br> You appear to be atleast '
        + (this.distance / this.tomiles).toFixed(2)
        + ' Miles away from the property.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.router.navigate(['/home/job-list']);
          }
        },
        {
          text: 'Confirm at Property',
          handler: () => {
            // this.logout();
            this.locationOverride = true;
          }
        }
      ]
    });
    await alert.present();
  }
  async onSubmit(event) {
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
      arrangement_data: this.arrangementInfo,
      locationOverride: this.locationOverride,
      distance: (this.distance / this.tomiles).toFixed(2)
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
      { name: 'form_data', value: `'${encodeURI(JSON.stringify(form_data))}'` },
      { name: 'created_at', value: `'${moment().format('YYYY-MM-DD hh:mm:ss')}'` },
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
      this.databaseService.insert('visit_reports', visitFormData).then(async (data) => {
        await this.storageService.set('isVisitFormSync', false);
        this.commonService.showToast('Data Saved Locally.');
        this.router.navigate(['/home/job-list']);
      }, (error) => {
      });

    }
  }

  ionViewWillLeave() {
    this.storageService.remove('caseId');
  }
}
