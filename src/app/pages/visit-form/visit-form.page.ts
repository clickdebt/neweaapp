import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services';

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
  constructor(
    private visitService: VisitService
  ) { }

  ngOnInit() {
    this.visitService.getVisitForm().subscribe(res => {
      this.dataRead(res);
      // this.formData = res.data[0].content;
    }, err => {
      console.log(err);
    });

  }

  ionViewWillEnter() {
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

    if (variables.length > 0) {
      variables.forEach(variable => {

        let fieldkeyArr = variable.split('{{');
        console.log(fieldkeyArr);
        fieldkeyArr = fieldkeyArr[1].split('}');
        console.log(fieldkeyArr);
        const fieldKey = fieldkeyArr[0];
        this.jsonString = this.jsonString.replace('{{' + fieldKey + '}}', 'saasasa');
        console.log(this.jsonString);
      });
      this.jsonObject = JSON.parse(this.jsonString);
      for (let i = 0; i < this.jsonObject.components.length; i++) {
        for (let j = 0; j < this.jsonObject.components[i].components.length; j++) {
          this.jsonObject.components[i].components[j].widget = 'html5';
        }
      }
      // tslint:disable-next-line: prefer-for-of
      // for (let i = 0; i < matchArr[0].length; ++i) {
      //   const strKey = matchArr[0][i];
      //   let fieldkeyArr = strKey.split('{{');
      //   fieldkeyArr = fieldkeyArr[1].split('}');
      //   const fieldKey = fieldkeyArr[0];
      //   this.jsonString = this.jsonString.replace('{{x,y}}', this.lat + ' , ' + this.lang);
      //   this.jsonString = this.jsonString.replace('{{' + fieldKey + '}}', 'saasasa');
      //   this.jsonString = this.jsonString.replace('{{' + fieldKey + '}}', 'sasasasasasa');
      // }
    }

    // this.jsonOBject = JSON.parse(this.jsonString);
    // console.log(this.jsonOBject);

    // const visitOutcomeObj = {
    //   type: 'select',
    //   label: 'Visit Outcome',
    //   key: 'visit_outcome',
    //   placeholder: 'Select Visit Outcome',
    //   data: this.resultobj,
    //   dataSrc: 'values',
    //   template: '<span>{{ item.label }}</span>',
    //   input: true

    // };

    // const ComponentLength = this.jsonOBject.components.length;
    // this.jsonOBject.components[ComponentLength - 1].components.push(visitOutcomeObj);
    // // tslint:disable-next-line: prefer-for-of
    // for (let i = 0; i < this.jsonOBject.components.length; i++) {
    //   // tslint:disable-next-line: prefer-for-of
    //   for (let j = 0; j < this.jsonOBject.components[i].components.length; j++) {
    //     this.jsonOBject.components[i].components[j].widget = 'html5';
    //   }
    // }


    // // this.jsonOBject.components[0].components[3].widget= 'html5';
    // this.jsonOBject.components[1].clickable = false;
    // console.log(this.jsonOBject)

  }
}
