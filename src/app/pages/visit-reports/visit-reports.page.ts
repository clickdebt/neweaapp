import { Component, OnInit } from '@angular/core';
import { CaseService } from 'src/app/services';

@Component({
  selector: 'app-visit-reports',
  templateUrl: './visit-reports.page.html',
  styleUrls: ['./visit-reports.page.scss'],
})
export class VisitReportsPage implements OnInit {

  visitReports = [];
  limit = 20;
  page = 1;
  caseId;
  created_at = '3';
  constructor(
    private caseservice: CaseService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.visitReports = [];
    this.page = 1;
    this.getReports('');
  }

  getReports(infiniteScrollEvent) {
    let params = {
      limit: this.limit,
      page: this.page++,
      case_id: '',
      created_at: ''
    };

    if (this.caseId) {
      params.case_id = this.caseId;
    }
    if (this.created_at) {
      params.created_at = this.created_at;
    }
    this.caseservice.getVisitReports(params)
      .subscribe(response => {
        this.parseReports(response['data']);
        if (infiniteScrollEvent) {
          infiniteScrollEvent.target.complete();
        }
      }, error => {
        console.log(error);
      });
  }
  onInput() {
    this.page = 1;
    this.visitReports = [];
    this.getReports('');
  }
  parseReports(data) {
    data.forEach(element => {
      const form_values = JSON.parse(element.form_values);
      const obj = {
        case_id: element.case_id,
        created_at: element.created_at,
        address: form_values.form_data != undefined ? form_values.form_data.address1
          + form_values.form_data.address2
          + form_values.form_data.address3
          + form_values.form_data.townCity : '',
        postcode: form_values.form_data.postcode,
        outcome: form_values.form_data.visit_outcome
      };
      this.visitReports.push(obj);
    });
  }

  loadData(infiniteScrollEvent) {
    this.getReports(infiniteScrollEvent);
  }

}
