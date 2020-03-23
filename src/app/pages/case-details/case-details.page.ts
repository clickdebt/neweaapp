import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services';
import { CaseDetailsService } from 'src/app/services/case-details.service';

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.page.html',
  styleUrls: ['./case-details.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CaseDetailsPage implements OnInit {
  caseId;
  currentCaseData: any = {};
  caseDetails: any = {
    caseMarkers: {
      show: false,
      fields: []
    },
    caseSummary: {
      show: false
    },
    client: {},
    financialDetails: {
      show: false
    },
    caseDetail: {
      show: false
    },
    history: {
      show: false,
      history_data: []
    },
    payments: {
      show: false
    }
  };
  historyData: any[] = [];
  historyDataIndex = 10;
  searchBarValue = '';
  historyFilterData: any[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private caseDetailsService: CaseDetailsService) { }

  ngOnInit() {
    this.caseId = this.route.snapshot.params.id;
    this.currentCaseData = JSON.parse(localStorage.getItem('detais_case_data'));
    this.currentCaseData.show = false;
  }

  async ionViewWillEnter() {
    this.getCaseMarkers();
    this.getSummary();
    this.getClient();
    this.getfinancialDetails();
    this.getCaseDetails();
    this.getHistory();
    this.getPayments();
  }

  onSelectChange(event) {
    // console.log(event);
  }

  toggleShow(object) {
    object.show = !object.show;
  }

  isShown(object) {
    return object.show;
  }

  getCaseMarkers() {
    this.caseDetailsService.getCaseMarkers(this.caseId).subscribe((response: any) => {
      this.caseDetails.caseMarkers.fields = response.data.fields;
    });
  }

  colorCondition(index) {
    if (parseInt(index, 10) === 0) {
      return 'light';
    } else if (parseInt(index, 10) === 1) {
      return 'success';
    } else {
      return 'danger';
    }
  }

  getSummary() {
    this.caseDetailsService.getSummary(this.caseId).subscribe((response: any) => {
      this.caseDetails.caseSummary = Object.assign(this.caseDetails.caseSummary, response.case_summary);
    });
  }
  getClient() {
    this.caseDetailsService.getClient(this.caseId).subscribe((response: any) => {
      this.caseDetails.client = response.case_participants.client;
    });
  }

  getfinancialDetails() {
    this.caseDetailsService.getfinancialSummary(this.caseId).subscribe((response: any) => {
      this.caseDetails.financialDetails = Object.assign(this.caseDetails.financialDetails,
        response.case_financials);
    });
  }
  getCaseDetails() {
    this.caseDetailsService.getCaseDetails(this.caseId).subscribe((response) => {
      this.caseDetails.caseDetail = Object.assign(this.caseDetails.caseDetail, response);
    });
  }
  getHistory() {
    this.caseDetailsService.getHistory(this.caseId).subscribe((response) => {
      this.caseDetails.history = Object.assign(this.caseDetails.history, response);
      this.caseDetails.history.history_data.sort((a, b) => {
        if (new Date(a.time) > new Date(b.time)) {
          return -1;
        } else if (new Date(a.time) < new Date(b.time)) {
          return 1;
        }
        return 0;
      });
      this.historyData = this.caseDetails.history.history_data;
      this.historyFilterData = this.historyData.slice(0, this.historyDataIndex);
    });
  }

  loadData(infiniteScrollEvent) {
    this.historyFilterData = this.historyFilterData.concat(this.historyData.slice(this.historyDataIndex, this.historyDataIndex + 10));
    this.historyDataIndex += 10;
    infiniteScrollEvent.target.complete();
  }
  onInput(event) {
    this.searchBarValue = event.target.value.toLowerCase();
    this.historyFilterData = [];
    console.log(this.searchBarValue, event);

    if (this.searchBarValue) {
      this.historyData = this.caseDetails.history.history_data.filter((history) => {
        if (history.time.toLowerCase().includes(this.searchBarValue)) {
          return true;
        } else if (history.note.toLowerCase().includes(this.searchBarValue)) {
          return true;
        } else {
          return history.action.toLowerCase().includes(this.searchBarValue);
        }
      });
    } else {
      this.historyData = this.caseDetails.history.history_data;
    }
    this.historyDataIndex = 10;
    this.historyFilterData = this.historyData.slice(0, this.historyDataIndex);
  }

  getPayments() {
    this.caseDetailsService.getPayments(this.caseId).subscribe((response: any) => {
      this.caseDetails.payments.paymentData = response.payment_data;
      this.caseDetails.payments.paymentData.sort((a, b) => {
        if (new Date(a.date) > new Date(b.date)) {
          return -1;
        } else if (new Date(a.date) < new Date(b.date)) {
          return 1;
        }
        return 0;
      });
      console.log(this.caseDetails);
    });
  }
}
