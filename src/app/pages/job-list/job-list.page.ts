import { Component, OnInit } from '@angular/core';
import { CaseService, DatabaseService } from '../../services';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { Platform } from '@ionic/angular';
import * as moment from 'moment';
import { NetworkService } from 'src/app/services/network.service';
import { element } from 'protractor';
@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.page.html',
  styleUrls: ['./job-list.page.scss'],
})
export class JobListPage implements OnInit {
  limit = 50;
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
    { title: 'Old Cases', isChecked: false, value: 'id|ASC' },
    { title: 'Latest Cases', isChecked: false, value: 'id|DESC' },
    { title: 'Name A-Z', isChecked: false, value: 'ISNULL(Debtor.debtor_1_surname), Debtor.debtor_1_surname ASC, Debtor.debtor_name|ASC' },
    { title: 'Name Z-A', isChecked: false, value: 'ISNULL(Debtor.debtor_1_surname), Debtor.debtor_1_surname DESC, Debtor.debtor_name|DESC' },
    { title: 'Scheme', isChecked: false, value: 'Scheme.name|ASC' },
    { title: 'Balance Low to High', isChecked: false, value: 'd_outstanding|ASC' },
    { title: 'Balance High to Low', isChecked: false, value: 'd_outstanding|DESC' },
    { title: 'Next payment Date', isChecked: false, value: 'ISNULL(ActiveArrangement.last_due_date), ActiveArrangement.last_due_date|ASC' },
    { title: 'Hold Expires', isChecked: false, value: 'ISNULL(Cases.hold_until), Cases.hold_until|Asc' },
    { title: 'Case Ref', isChecked: false, value: 'cast(Cases.ref as unsigned)|ASC' },
    { title: 'PostCode', isChecked: false, value: 'EnforcementAddresses.address_postcode|ASC' },
    { title: 'Visits Low to High', isChecked: false, value: 'visitcount_total|ASC' },
    { title: 'Visits High to Low', isChecked: false, value: 'visitcount_total|DESC' },
    { title: 'Visit Allocated Oldest to Newest', isChecked: false, value: 'last_allocated_date|ASC' },
    { title: 'Visit Allocated Newest to Oldest', isChecked: false, value: 'last_allocated_date|DESC' },
    { title: 'Work Type', isChecked: false, value: 'SchemeManager.name|ASC' },
    { title: 'Last Visit Date Asc', isChecked: false, value: 'ISNULL(Cases.last_visit_date), Cases.last_visit_date|ASC' },
    { title: 'Last Visit Date Desc', isChecked: false, value: 'ISNULL(Cases.last_visit_date), Cases.last_visit_date|DESC' }
  ];
  isMobile = false;
  selectedCaseIds: any[] = [];
  currentNetworkStatus;
  selectedAll = false;
  currentDate;
  linkedIds = [];
  busy = false;
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

  async ionViewWillEnter() {
    this.currentNetworkStatus = this.networkService.getCurrentNetworkStatus();
    this.showFilter = false;
    this.showSort = false;
    // this.getFilters();
    // if (!(this.cases.length > 0)) {
    //   this.getCases('');
    // } else if (await this.storageService.get('is_case_updated')) {
    this.page = 1;
    this.cases = [];
    this.linkedIds = [];
    this.getCases('');
    if (await this.storageService.get('is_case_updated')) {
      this.updateCasesData();
      await this.storageService.set('is_case_updated', false);
    }
    // }
    this.currentDate = moment().format('YYYY-MM-DD hh:mm:ss');
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
    this.showSort = false;
    this.page = 1;
    this.cases = [];
    this.linkedIds = [];
    this.getCases('');
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
    this.linkedIds = [];
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
    this.linkedIds = [];
    this.getCases('');

  }
  onInput() {
    this.filters['q'] = this.searchBarValue;
    this.filterCases();
  }

  async getCases(infiniteScrollEvent) {
    let params = {
      limit: this.limit,
      page: this.page
    };
    Object.keys(this.filters).forEach(fil => {
      if (this.filters[fil] != undefined && this.filters[fil].length) {
        params[fil] = typeof this.filters[fil] == 'object' ? this.filters[fil].join() : this.filters[fil];
      }
    });
    if (this.networkService.getCurrentNetworkStatus() == 1) {
      if (!this.busy) {
        this.busy = true;
        this.caseService.getCases(params).subscribe((res: any) => {
          this.busy = false;
          if (infiniteScrollEvent) {
            infiniteScrollEvent.target.complete();
          }
          if (res.result) {
            this.page++;
            this.parseCaseData(res.data, res.linked);
          }
        });
      }
    } else {
      let query = 'select * from rdebt_cases where 1 = 1';
      let p = [];
      for (let key in params) {
        if (params.hasOwnProperty(key) && params[key] !== '') {
          if (key !== 'limit' && key !== 'page') {
            if (key === 'stages') {
              query += ' and current_stage_id in ( ? ) ';
              p.push(params[key]);
            } else if (key === 'schemes') {
              query += ' and scheme_id in ( ? )';
              p.push(params[key]);
            } else if (key === 'statuses') {
              query += ' and current_status_id in ( ? )';
              p.push(params[key]);
            } else if (key === 'clients') {
              query += ' and client_id in ( ? )';
              p.push(params[key]);
            } else if (key === 'visitCounts') {
              let vcquery = ' visitcount_total in ( ? ) ';
              p.push(params[key]);
              if (params[key].indexOf('4') !== -1) {
                vcquery += ' or visitcount_total > ? ';
                p.push('4');
              }
              query += ' and (' + vcquery + ') ';
            } else if (key === 'stageType') {
              query += ' and scheme_id in ( ? )';
              p.push(params[key]);
            } else if (key === 'outstandingAmount') {
              const osfilter = params[key].split(',');
              let osQuery = [];
              osfilter.forEach(element => {
                if (element.indexOf('-') !== -1) {
                  osQuery.push(' d_outstanding between ? and ? ');
                  const oa = element.split('-');
                  p.push(oa[0]);
                  p.push(oa[1]);
                } else if (element.indexOf('>') !== -1) {
                  osQuery.push(' d_outstanding > ? ');
                  // ---------------------------------------------------------- get 2000 from >2000 string
                  p.push(2000);
                } else if (element === 'equals to zero') {
                  osQuery.push(' d_outstanding = 0 ');
                }
              });
              query += ' and ( ' + osQuery.join(' or ') + ') ';
            } else if (key === 'stageType') {

              // query += ' ' + key + 'in ? and ';
              // p.push('(' + params[key] + ')');
            }
          }
        }
      }
      query += ' LIMIT ' + this.limit + ' OFFSET ' + (this.limit * (this.page - 1));
      this.databaseService.executeQuery(query, p).then((data) => {
        const results: any[] = [];
        let item;
        for (let i = 0; i < data.rows.length; i++) {
          item = data.rows.item(i);
          item.data = JSON.parse(decodeURI(item.data));
          results.push(item.data);
        }
        if (data.rows.length > 0) {
          this.page++;
          this.parseCaseData(results, []);
        }
        if (infiniteScrollEvent) {
          infiniteScrollEvent.target.complete();
        }
      });
    }

  }

  goToVisitForm(visitCase) {
    localStorage.setItem('visit_case_data', JSON.stringify(visitCase));
    this.storageService.set('caseId', visitCase.id);
    this.router.navigate(['/home/visit-form/' + visitCase.id]);
  }
  loadData(infiniteScrollEvent) {
    this.getCases(infiniteScrollEvent);

  }
  parseCaseData(caseData, linkedCases) {

    caseData.forEach((elem) => {
      if (this.linkedIds.indexOf(elem.id) == -1) {
        elem.linkedCasesTotalBalance = 0;
        // if (elem.debtor_linked_cases != undefined && (elem.linked_cases != '' || elem.debtor_linked_cases != '') {
        elem.linked_cases_group = linkedCases.filter(linked => (
          ((linked.manual_link_id === elem.manual_link_id && linked.manual_link_id !== null) || linked.debtorid === elem.debtorid)
          && (this.linkedIds.indexOf(linked.id) == -1)
        ));
        elem.linked_cases = linkedCases.filter(linked => (
          ((linked.manual_link_id === elem.manual_link_id && linked.manual_link_id !== null) || linked.debtorid === elem.debtorid)
          && linked.id !== elem.id && (this.linkedIds.indexOf(linked.id) == -1)
        ));
        if (elem.linked_cases != '') {
          (elem.linked_cases).forEach(l => {
            l.parent_case_id = elem.id;
            this.linkedIds.push(l.id);
          });
          const linked = elem.linked_cases.map(l => l.id);
          caseData = caseData.filter(c => {
            return (linked.indexOf(c.id) == -1);
          });
          elem.linked_cases = Object.values(elem.linked_cases);
          elem.linkedCasesTotalBalance = parseFloat(elem.d_outstanding) + elem.linked_cases.reduce((accumulator, currentValue) => {
            return accumulator + parseFloat(currentValue.d_outstanding);
          }, 0);
        }
      }
    });
    this.cases = this.cases.concat(caseData);
    // no need to select cases that will load after select all
    if (this.selectedAll) {
      this.selectAllCase();
    }
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
    let currCase = JSON.parse(JSON.stringify(currentCaseData));
    if (currCase.parent_case_id) {
      const parent_case = this.cases.find(c => c.id == currCase.parent_case_id);
      currCase.linked_cases = parent_case.linked_cases_group.filter(link => link.id !== currCase.id);
    }
    localStorage.setItem('detais_case_data', JSON.stringify(currCase));
    this.storageService.set('caseId', currCase.id);
    this.router.navigate(['/home/case-details/' + currCase.id]);
  }
  selectAllCase() {
    this.selectedCaseIds = [];
    this.cases.forEach((currentCase) => {
      currentCase.checked = this.selectedAll;
      if (this.selectedAll) {
        this.selectedCaseIds.push(currentCase.id);
      }
      // no need to select linked cases
      // if (currentCase.linked_cases.length) {
      //   currentCase.linked_cases.forEach((currentLinkedCases) => {
      //     currentLinkedCases.checked = this.selectedAll;
      //     if (this.selectedAll) {
      //       this.selectedCaseIds.push(currentLinkedCases.id);
      //     }
      //   });
      // }
    });
  }
  async updateCasesData() {
    const downloadStatus = await this.databaseService.getDownloadStatus();

    this.caseService.getCases({ last_update_date: downloadStatus.time }, 1).subscribe(async (response: any) => {
      if (response) {
        console.log(response);

        await this.databaseService.setCases(response.data);
        this.caseService.getFilterMasterData().subscribe(async (data: any) => {
          await this.databaseService.setFilterMasterData(data.data);
        });
        await this.databaseService.setDownloadStatus({
          status: true,
          time: moment().format('YYYY-MM-DD hh:mm:ss')
        });
      }
    });
  }
}
