import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services';
import { StorageService } from 'src/app/services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  constructor(
    private visitService: VisitService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.visitService.getVisitForm().subscribe(res => {
      this.dataRead(res);
      // this.formData = res.data[0].content;
    }, err => {
      console.log(err);
    });

  }

  async ionViewWillEnter() {
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
    this.getLocation();
    const casesData = await this.storageService.get('cases');
    const visitCaseData = casesData.find(c => c.id = this.route.snapshot.params['id']);
    this.addressData = {
      address_ln1: visitCaseData.debtor.addresses[0].address_ln1,
      address_ln2: visitCaseData.debtor.addresses[0].address_ln2,
      address_ln3: visitCaseData.debtor.addresses[0].address_ln3,
      address_town: visitCaseData.debtor.addresses[0].address_town,
      address_postcode: visitCaseData.debtor.addresses[0].address_postcode,
    };
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
    console.log(variables);

    if (variables && variables.length > 0) {
      variables.forEach(variable => {
        let fieldkeyArr = variable.split('{{');
        fieldkeyArr = fieldkeyArr[1].split('}');
        const fieldKey = fieldkeyArr[0];
        if (this.addressData.hasOwnProperty(fieldKey)) {
          console.log(fieldKey, this.addressData[fieldKey]);
          this.jsonString = this.jsonString.replace('{{' + fieldKey + '}}', this.addressData[fieldKey]);
        }
      });
      this.jsonString = this.jsonString.replace('{{x,y}}', this.lat + ' , ' + this.lang);
    }
    this.jsonObject = JSON.parse(this.jsonString);
  }

  getLocation() {

  }
}
