import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../services';
import { isArray } from 'util';
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
    this.getCases();
  }
  getCases() {
    let params = {
      limit: this.limit,
      page: this.page++
    }
    this.caseService.getCases(params).subscribe(res => {
      if (res['result']) {
        this.parseCaseData(res['data']);
      }
    });
  }
  loadData(infiniteScrollEvent) {
    console.log(infiniteScrollEvent);
    this.getCases();
    infiniteScrollEvent.complete();

  }
  parseCaseData(caseData) {
    // caseData.forEach(elem => {
    //   elem.has_linked_cases = false;
    //   if (typeof (elem.linked_cases)) {
    //     console.log(elem.linked_cases != '');
    //     elem.has_linked_cases = true;
    //   }
    // });
    this.cases = this.cases.concat(caseData);
  }

}
