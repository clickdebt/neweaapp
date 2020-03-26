import { Component, OnInit } from '@angular/core';
import { CaseService, DatabaseService } from '../../services';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { Platform } from '@ionic/angular';
import { NetworkService } from 'src/app/services/network.service';
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
  isMobile = false;
  selectedCaseIds: any[] = [];
  constructor(
    private caseService: CaseService,
    private router: Router,
    private storageService: StorageService,
    private platform: Platform,
    private networkService: NetworkService,
    private databaseService: DatabaseService
  ) { }

  ngOnInit() {
    this.isMobile = this.platform.is('mobile');
    this.getFilterMasterData();
  }

  ionViewWillEnter() {
    this.showFilter = false;
    this.showSort = false;
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
    if (this.networkService.getCurrentNetworkStatus() == 1) {
      this.caseService.getCases(params).subscribe((res: any) => {
        if (infiniteScrollEvent) {
          infiniteScrollEvent.target.complete();
        }
        if (res.result) {
          this.page++;
          this.parseCaseData(res.data);
        }
      });
    } else {
      let query = 'select * from rdebt_cases where 1 = 1 ';
      let p = [];
      for (let key in params) {
        if (params.hasOwnProperty(key) && params[key] !== '') {
          if (key !== 'limit' && key !== 'page') {
            if (key === 'stages') {
              query += ' and current_stage_id in ? ';
              p.push('(' + params[key] + ')');
            } else if (key === 'schemes') {
              query += ' and scheme_id in ? ';
              p.push('(' + params[key] + ')');
            } else if (key === 'statuses') {
              query += ' and current_status_id in ? ';
              p.push('(' + params[key] + ')');
            } else if (key === 'clients') {
              query += ' and client_id in ? ';
              p.push('(' + params[key] + ')');
            } else if (key === 'visitCounts') {
              let vcquery = ' visitcount_total in ? ';
              p.push('(' + params[key] + ')');
              if (params[key].indexOf('4') !== -1) {
                vcquery += ' or visitcount_total > ? ';
                p.push('4');
              }
              query += ' and (' + vcquery + ') ';
            } else if (key === 'stageType') {
              query += ' and scheme_id in ? ';
              p.push('(' + params[key] + ')');
            } else if (key === 'outstandingAmount') {
              const osfilter = params[key].split(',');
              let osQuery = [];
              osfilter.forEach(element => {
                if (element.indexOf('-') !== -1) {
                  osQuery.push(' d_outstanding between ? and ? ') ;
                  const oa = element.split('-');
                  p.push(oa[0]);
                  p.push(oa[1]);
                } else if (element.indexOf('>') !== -1) {
                  osQuery.push(' d_outstanding > ? ') ;
                  // ---------------------------------------------------------- get 2000 from >2000 string
                  p.push(2000);
                } else if (element === 'equals to zero') {
                  osQuery.push(' d_outstanding = 0 ');
                }
              });
              query +=  ' and ( ' + osQuery.join(' or ') + ') ';
            } else if (key === 'stageType') {

              // query += ' ' + key + 'in ? and ';
              // p.push('(' + params[key] + ')');
            }
          }
        }
      }
      this.databaseService.executeQuery(query, p);
    }

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
      elem.linkedCasesTotalBalance = 0;
      // if (elem.debtor_linked_cases != undefined && (elem.linked_cases != '' || elem.debtor_linked_cases != '') {
      if (elem.linked_cases != '') {
        elem.linked_cases = Object.values(elem.linked_cases);
        elem.linkedCasesTotalBalance = elem.linked_cases.reduce((accumulator, currentValue) => {
          return accumulator + parseFloat(currentValue.d_outstanding);
        }, 0);
      }
    });
    this.cases = this.cases.concat(caseData);
    this.storageService.set('cases', this.cases);
  }

  async getFilterMasterData() {
    if (this.networkService.getCurrentNetworkStatus() == 1) {
      this.caseService.getFilterMasterData().subscribe((res: any) => {
        this.filterMaster = res.data;
      }, err => {
        console.log(err);
      });
    } else {
      const filters = await this.storageService.get('filters');
      if (filters) {
        this.filterMaster = filters;
      }
    }
  }

  selectCase(event, caseId) {
    if (event.detail.checked) {
      if (!this.selectedCaseIds.includes(caseId)) {
        this.selectedCaseIds.push(caseId);
      }
    } else {
      if (this.selectedCaseIds.includes(caseId)) {
        this.selectedCaseIds.splice(this.selectedCaseIds.indexOf(caseId), 1);
      }
    }
  }
  showCasesOnMap() {
    this.storageService.set('selected_cases_for_map', this.selectedCaseIds);
    this.router.navigate(['home/map-view']);
  }
  goToCaseDetails(currentCaseData) {
    localStorage.setItem('detais_case_data', JSON.stringify(currentCaseData));
    this.router.navigate(['/home/case-details/' + currentCaseData.id]);
  }
}
