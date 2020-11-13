import { Component, OnInit } from '@angular/core';
import { CaseService, DatabaseService } from '../../services';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { Platform, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { NetworkService } from 'src/app/services/network.service';
import { element } from 'protractor';
import { PanicModalPage } from '../panic-modal/panic-modal.page';
import { SosService } from 'src/app/services/sos.service';
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
    { title: 'Need a Visit', isChecked: true, id: 'Visit', type: 'stageType' }
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
  caseFields;
  colspanLength;
  totalFields = [
    { field: 'id', label: 'Id' },
    { field: 'scheme_id', label: 'Scheme Id' },
    { field: 'ref', label: 'Ref' },
    { field: 'debtorid', label: 'Debtor Id' },
    { field: 'debtor.debtor_id', label: 'Debtor Id' },
    { field: 'debtor.debtor_name', label: 'Debtor Name' },
    { field: 'debtor.debtor_phone', label: 'Debtor Phone' },
    { field: 'debtor.debtor_mobile', label: 'Debtor Mobile' },
    { field: 'client_id', label: 'Debtor Mobile' },
    { field: 'manual_link_id', label: 'Manual Link Id' },
    { field: 'bailiffid', label: 'Ballif Id' },
    { field: 'd_outstanding', label: 'Amount' },
    { field: 'visitcount_total', label: 'visit' },
    { field: 'current_status.status_name', label: 'Status' },
    { field: 'current_status_id', label: 'Current Status ID' },
    { field: 'current_status.status_type', label: 'Current Status Type' },
    { field: 'current_stage_id', label: 'Current Stage ID' },
    { field: 'stage.stage_type.stage_type', label: 'Stage Type' },
    { field: 'date', label: 'Date' },
    { field: 'last_allocated_date', label: 'Last Allocate Date' },
    { field: 'hold_until', label: 'Hold' },
    { field: 'debtor.enforcement_addresses[0].address_ln1', label: 'Enforcement Address Line 1' },
    { field: 'debtor.enforcement_addresses[0].address_ln2', label: 'Enforcement Address Line 2' },
    { field: 'debtor.enforcement_addresses[0].address_ln3', label: 'Enforcement Address Line 3' },
    { field: 'debtor.enforcement_addresses[0].address_town', label: 'Enforcement Address Town' },
    { field: 'debtor.enforcement_addresses[0].address_postcode', label: 'Postcode' },
    { field: 'debtor.addresses[0].address_ln1', label: 'Address Line 1' },
    { field: 'debtor.addresses[0].address_ln2', label: 'Address Line 2' },
    { field: 'debtor.addresses[0].address_ln3', label: 'Address Line 3' },
    { field: 'debtor.addresses[0].address_town', label: 'Address Line Town' },
    { field: 'debtor.addresses[0].address_postcode', label: 'Postcode' },
    { field: 'custom5', label: 'VRM' },
    { field: 'linkedCasesTotalBalance', label: ' Linked Cases Amount Total' }
  ];
  constructor(
    private caseService: CaseService,
    private router: Router,
    private storageService: StorageService,
    private platform: Platform,
    private networkService: NetworkService,
    private databaseService: DatabaseService,
    private modalCtrl: ModalController,
  ) { }

  async ngOnInit() {
    this.caseFields = await this.storageService.get('fields');
    if(this.caseFields) {
      this.caseFields = this.totalFields.filter((c) => {
        if (this.caseFields.includes(c.field)) {
          return true;
        }
      });
    } else {
      this.caseFields = ["current_status.status_name","ref","d_outstanding","visitcount_total","custom5","debtor.enforcement_addresses[0].address_postcode"];
    }
    this.colspanLength = 6 + this.caseFields.length;
    this.isMobile = this.platform.is('mobile');
    this.getFilterMasterData();
  }

  async ionViewWillEnter() {
    this.currentNetworkStatus = this.networkService.getCurrentNetworkStatus();
    this.showFilter = false;
    this.showSort = false;
    // this.getFilters();
    if (!(this.cases.length > 0)) {
      this.filterCases();
    } else if (await this.storageService.get('is_case_updated')) {
      this.page = 1;
      this.cases = [];
      this.linkedIds = [];
      this.getCases('');
      this.updateCasesData();
      await this.storageService.set('is_case_updated', false);
    }
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

  filterCases(clear = true) {
    this.filters = [];
    if (this.searchBarValue) {
      this.filters['q'] = this.searchBarValue;
    }

    if (this.filterMaster) {
      Object.keys(this.filterMaster).forEach(key => {
        this.filters[key] = this.filterMaster[key].filter(elm => elm.isChecked).map(s => s.id);
      });
    }
    if (!this.filters['q']) {
      this.quick.forEach(elm => {
        this.filters[elm.type] = [];
        if (elm.isChecked) {
          this.filters[elm.type] = [elm.id];
        }
      });
    }
    this.filters['sorting'] = this.sortVal;
    this.page = 1;
    this.cases = [];
    this.showFilter = false;
    this.showSort = false;
    this.linkedIds = [];
    this.getCases('');

  }
  // onInput() {
  //   this.filters['q'] = this.searchBarValue;
  //   this.filterCases();
  // }

  async getCases(infiniteScrollEvent) {
    let params = {
      limit: this.limit,
      page: this.page
    };
    console.log(this.filters);
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
              query += ' and stage_type in ( ? )';
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
            } else if (key === 'q') {
              query += ' and (id = ? or ref LIKE ?) ';
              p.push(params[key]);
              p.push('%' + params[key] + '%');
            }
          }
        }
      }
      query += ' LIMIT ' + this.limit + ' OFFSET ' + (this.limit * (this.page - 1));
      console.log(query);
      this.databaseService.executeQuery(query, p).then((data) => {
        const results: any[] = [];
        let item;
        for (let i = 0; i < data.rows.length; i++) {
          item = data.rows.item(i);
          item.data = JSON.parse(decodeURI(item.data));
          results.push(item.data);
        }
        console.log(results);
        if (data && data.rows.length > 0) {
          this.page++;
          this.cases = this.cases.concat(results);
          // this.parseCaseData(results, []);

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

    if (linkedCases) {
      caseData.forEach((elem) => {
        if (this.linkedIds.indexOf(elem.id) == -1) {
          // console.log(elem.id);
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
            elem.linkedCasesTotalBalance = (elem.linkedCasesTotalBalance).toFixed(2);
          }
        } else {
          caseData = caseData.filter(cd => cd.id != elem.id);
        }
      });
    }
    this.cases = this.cases.concat(caseData);
    // no need to select cases that will load after select all
    if (this.selectedAll) {
      this.selectAllCase();
    }
    // console.log(this.cases);
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

        await this.databaseService.setCases(response.data, response.linked);
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
  async openPanicModal() {
    const selectedCase = this.cases.filter((c) => c.id === this.selectedCaseIds[0]);

    const panicModalPage = await this.modalCtrl.create({
      component: PanicModalPage, componentProps: {
        cssClass: 'case-action-modal',
        selectedCase: selectedCase[0]
      }
    });
    await panicModalPage.present();
  }

  getCaseFieldValue(value, caseField) {
    const currentCase = value;
    const res = caseField.split('.');
    res.forEach((r) => {
      let r1 = r.split('[');
      if(r1.length > 1) {
        value = value[r1[0]][0];
      } else {
        value = value[r];
      }
      if (Array.isArray(value)) {
        if (value[0]) {
          value = value[0];
        } else {
          value = [];
        }
      }
      if (r === 'address_postcode') {
        if (!value && currentCase.debtor.addresses[0].address_postcode) {
          value = currentCase.debtor.addresses[0].address_postcode;
        }
      }
      if (r === 'hold_until') {
        if (value != null && value > new Date()) {
          value = 'Yes';
        } else {
          value = 'No';
        }
      }
    });
    return value;
  }
  getLinkedCaseFieldValue(value, caseField) {
    const res = caseField.split('.');
    if (res[res.length - 1] === 'hold_until') {
      if (value[res[res.length - 1]] != null && value[res[res.length - 1]] > new Date()) {
        return 'Yes';
      } else {
        return 'No';
      }
    } else {
      return value[res[res.length - 1]];
    }
  }
}
