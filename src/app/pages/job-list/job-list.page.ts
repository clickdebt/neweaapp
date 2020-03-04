import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../services';
@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.page.html',
  styleUrls: ['./job-list.page.scss'],
})
export class JobListPage implements OnInit {
  limit = 20;
  page = 1;
  cases = [];
  constructor(
    private caseService: CaseService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let params = {
      limit: this.limit,
      page: this.page
    }
    this.caseService.getCases(params).subscribe(res => {
      if (res['result']) {
        this.parseCaseData(res['data']);
      }
    });
  }

  parseCaseData(caseData) {
    caseData.forEach(elem => {
      elem.linked_cases = [];
    });
    this.cases = caseData;
  }

}
