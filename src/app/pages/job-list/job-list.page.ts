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
  schemes = [
    { val: 'Parking Internal Agents (16)', isChecked: false, id: 1 },
    { val: 'CT External Agents (6)', isChecked: false, id: 2 },
    { val: 'CT Initial Workflow (4)', isChecked: false, id: 3 },
    { val: 'Parking Internal Agents (16)', isChecked: false, id: 4 },
    { val: 'CT External Agents (6)', isChecked: false, id: 5 },
    { val: 'CT Initial Workflow (4)', isChecked: false, id: 6 },
    { val: 'Parking Internal Agents (16)', isChecked: false, id: 7 },
    { val: 'CT External Agents (6)', isChecked: false, id: 8 },
    { val: 'CT Initial Workflow (4)', isChecked: false, id: 9 }
  ];
  stages = [
    { val: 'Parking Internal Agents (16)', isChecked: false, id: 1 },
    { val: 'CT External Agents (6)', isChecked: false, id: 2 },
    { val: 'CT Initial Workflow (4)', isChecked: false, id: 3 },
    { val: 'Parking Internal Agents (16)', isChecked: false, id: 4 },
    { val: 'CT External Agents (6)', isChecked: false, id: 5 },
    { val: 'CT Initial Workflow (4)', isChecked: false, id: 6 },
    { val: 'Parking Internal Agents (16)', isChecked: false, id: 7 },
    { val: 'CT External Agents (6)', isChecked: false, id: 8 },
    { val: 'CT Initial Workflow (4)', isChecked: false, id: 9 }
  ];
  form = [
    { val: 'Pepperoni', isChecked: false, id: 1 },
    { val: 'Sausage', isChecked: false, id: 2 },
    { val: 'Mushroom', isChecked: false, id: 3 }
  ];
  constructor(
    private caseService: CaseService,
    private router: Router,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.showFilter = false;
    this.showSort = false;
    if (!(this.cases.length > 0)) {
      this.getCases('');
    }
  }

  showFilterDiv() {
    this.showSort = false;
    this.showFilter = !this.showFilter;
  }

  showSortDiv() {
    this.showFilter = false;
    this.showSort = !this.showSort;
  }

  clearFilter() {
    this.filters = [];
    this.form.forEach(sc => sc.isChecked = false);
    this.schemes.forEach(sc => sc.isChecked = false);
    this.stages.forEach(sc => sc.isChecked = false);
  }

  filterCases() {
    const schemes = this.schemes.filter(sc => sc.isChecked).map(s => s.id);
    this.filters['schemes'] = schemes;

    const stages = this.stages.filter(sc => sc.isChecked).map(s => s.id);
    this.filters['stages'] = stages;

    console.log(this.filters);
  }
  onInput() {
    console.log(this.searchBarValue);
  }


  getCases(infiniteScrollEvent) {
    const params = {
      limit: this.limit,
      page: this.page
    };

    this.caseService.getCases(params).subscribe(res => {
      if (infiniteScrollEvent) {
        infiniteScrollEvent.target.complete();
      }
      if (res['result']) {
        this.page++;
        this.parseCaseData(res['data']);
      }
    });

    this.getFilters();
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

  async getFilters() {
    const filters = await this.storageService.get('filters');
    if (filters) {
      return this.setFilters(filters);
    }
    this.caseService.getFilters()
      .subscribe(async (response: any) => {
        if (response.data) {
          await this.storageService.set('filters', response.data);
          this.setFilters(response.data);
        }
      });
  }

  setFilters(filters: any = {}) {
    this.schemes = filters.schemes;
    this.stages = filters.stages;
    this.schemes.forEach(scheme => scheme.isChecked = false);
    this.stages.forEach(stage => stage.isChecked = false);
  }
}
