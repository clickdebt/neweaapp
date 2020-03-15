import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../services';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.page.html',
  styleUrls: ['./job-list.page.scss'],
})
export class JobListPage implements OnInit {
  limit = 20;
  page = 1;
  cases = [];
  showFilter = false;
  showSort = false;
  caseLinks = [];
  searchBarValue;
  filters = [];
  filterMaster;
  quick = [
    { title: 'Need a Visit', isChecked: false, id: 'Visit', type: 'stageType' }
  ];
  sortVal = '';
  shouldShowCancel: boolean;
  sortOptions = [
    { title: 'Latest Cases', isChecked: false, value: 'id|DESC' },
    { title: 'Scheme', isChecked: false, value: 'scheme_id|ASC' },
    { title: 'Balance Low to High', isChecked: false, value: 'd_outstanding|ASC' },
    { title: 'Balance High to Low', isChecked: false, value: 'd_outstanding|DESC' },
    { title: 'Case Ref', isChecked: false, value: 'ref|ASC' },
    { title: 'PostCode', isChecked: false, value: 'Addresses.address_postcode|ASC' },
    { title: 'Visits Low to High', isChecked: false, value: 'visitcount_total|ASC' },
    { title: 'Visits High to Low', isChecked: false, value: 'visitcount_total|DESC' },
    { title: 'Visit Allocated Oldest to Newest', isChecked: false, value: 'last_allocated_date|ASC' },
    { title: 'Visit Allocated Newest to Oldest', isChecked: false, value: 'last_allocated_date|DESC' }
  ];
  constructor(
    private caseService: CaseService,
    private router: Router,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.getFilterMasterData();
  }

  ionViewWillEnter() {
    this.showFilter = false;
    this.showSort = false;
    // this.getFilters();
    if (!(this.cases.length > 0)) {
      this.getCases('');
    }
  }

  radioGroupChange(event) {
    this.sortVal = event.detail.value;

  }
  showFilterDiv() {
    this.showSort = false;
    this.showFilter = !this.showFilter;
  }

  showSortDiv() {
    this.showFilter = false;
    this.showSort = !this.showSort;
  }
  clearSort() {
    this.sortVal = '';
  }
  clearFilter() {
    Object.keys(this.filterMaster).forEach(key => {
      this.filterMaster[key].forEach(elm => elm.isChecked = false);
    });
    this.quick.forEach(elm => {
      elm.isChecked = false;
    });
    this.filters = [];
    this.showFilter = false;
    this.page = 1;
    this.cases = [];
    this.getCases('');
  }

  filterCases() {
    Object.keys(this.filterMaster).forEach(key => {
      this.filters[key] = this.filterMaster[key].filter(elm => elm.isChecked).map(s => s.id);
    });
    this.quick.forEach(elm => {
      this.filters[elm.type] = [];
      if (elm.isChecked) {
        this.filters[elm.type] = [elm.id];
      }
    });
    this.filters['sorting'] = this.sortVal;
    this.page = 1;
    this.cases = [];
    this.showFilter = false;
    this.showSort = false;
    this.getCases('');

  }
  onInput(event) {
    this.filters['q'] = this.searchBarValue;
    this.filterCases();
  }

  getCases(infiniteScrollEvent) {
    let params = {
      limit: this.limit,
      page: this.page
    };
    Object.keys(this.filters).forEach(fil => {
      if (this.filters[fil].length) {
        params[fil] = typeof this.filters[fil] == 'object' ? this.filters[fil].join() : this.filters[fil];
      }
    });
    this.caseService.getCases(params).subscribe(res => {
      if (infiniteScrollEvent) {
        infiniteScrollEvent.target.complete();
      }
      if (res['result']) {
        this.page++;
        this.parseCaseData(res['data']);
      }
    });
  }

  goToVisitForm(visitCase) {
    localStorage.setItem('visit_case_data', JSON.stringify(visitCase));
    this.router.navigate(['/home/visit-form/' + visitCase.id]);
  }
  loadData(infiniteScrollEvent) {
    this.getCases(infiniteScrollEvent);

  }
  parseCaseData(caseData) {
    caseData.forEach(elem => {
      // if (elem.debtor_linked_cases != undefined && (elem.linked_cases != '' || elem.debtor_linked_cases != '') {
      if (elem.linked_cases != '') {
        elem.linked_cases = Object.values(elem.linked_cases);
      }
    });
    this.cases = this.cases.concat(caseData);
    this.storageService.set('cases', this.cases);
  }

  getFilterMasterData() {
    this.caseService.getFilterMasterData().subscribe(res => {
      this.filterMaster = res['data'];
    }, err => {
      console.log(err);
    });
  }
  async getFilters() {
    // const filters = await this.storageService.get('filters');
    // if (filters) {
    //   this.filterMaster = filters;
    // } else {
    this.caseService.getFilters()
      .subscribe(async (response: any) => {
        if (response.data) {
          // await this.storageService.set('filters', response.data);
          this.filterMaster = response.data;
        }
      });
    // }
  }
}
