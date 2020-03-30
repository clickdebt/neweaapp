import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService, CommonService } from 'src/app/services';
import { CaseDetailsService } from 'src/app/services/case-details.service';
import { ModalController, AlertController } from '@ionic/angular';
import { AddNoteModalPage } from '../add-note-modal/add-note-modal.page';
import { OnHoldModalPage } from '../on-hold-modal/on-hold-modal.page';
import { AddFeeModalPage } from '../add-fee-modal/add-fee-modal.page';
import { CaseActionService } from 'src/app/services/case-action.service';

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
  actions: string[];
  SelectedAction = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private caseDetailsService: CaseDetailsService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private caseActionService: CaseActionService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.caseId = this.route.snapshot.params.id;
  }

  async ionViewWillEnter() {
    this.loadInitData();
  }

  loadInitData() {
    this.actions = ['Add Note', 'Add Vulnerability Status', 'Add H&S Status', 'On Hold', 'Add Fee', 'Deallocate case'];
    if (localStorage.getItem('detais_case_data')) {
      this.currentCaseData = JSON.parse(localStorage.getItem('detais_case_data'));
      this.getCaseMarkers();
      this.getSummary();
      this.getClient();
      this.getfinancialDetails();
      this.getCaseDetails();
      this.getHistory();
      this.getPayments();
    } else {
      this.router.navigate(['/home/job-list']);
    }
    this.currentCaseData.show = false;
  }
  onSelectChange(event) {
    if (this.SelectedAction === 'Add Note') {
      this.addNote();
    } else if (this.SelectedAction === 'Add Vulnerability Status') {
      this.addValnerabilityStatus();
    } else if (this.SelectedAction === 'Add H&S Status') {
      this.addHSStatus();
    } else if (this.SelectedAction === 'Deallocate case') {
      this.deallocateCase();
    } else if (this.SelectedAction === 'On Hold') {
      this.onHold();
    } else if (this.SelectedAction === 'Add Fee') {
      this.addFee();
    }
    this.SelectedAction = '';
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

  async addNote() {
    const AddNoteModal = await this.modalCtrl.create({
      component: AddNoteModalPage,
      componentProps: {
        caseId: this.caseId
      }
    });
    await AddNoteModal.present();
  }

  async addValnerabilityStatus() {
    const alert = await this.alertCtrl.create({
      header: 'Set Vulnerable Marker',
      message: 'Are you sure you want to Set Vulnerable Marker?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Save',
          handler: () => {
            this.caseActionService.saveVulnerableMarker(this.caseId).subscribe((response: any) => {
              if (response.data.result) {
                this.commonService.showToast(response.data.message, 'success');
              } else {
                this.commonService.showToast(response.data.message, 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async addHSStatus() {
    const alert = await this.alertCtrl.create({
      header: 'Set H&S Status',
      message: 'Are you sure you want to Set H&S Status?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Save',
          handler: () => {
            console.log('save');
          }
        }
      ]
    });
    await alert.present();
  }

  async onHold() {
    const OnHoldModal = await this.modalCtrl.create({
      component: OnHoldModalPage,
      componentProps: {
        caseId: this.caseId
      }
    });
    await OnHoldModal.present();
  }
  async addFee() {
    const AddFeeModal = await this.modalCtrl.create({
      component: AddFeeModalPage,
      componentProps: {
        caseId: this.caseId
      }
    });
    await AddFeeModal.present();
  }
  async deallocateCase() {
    const alert = await this.alertCtrl.create({
      header: 'Deallocate Case',
      message: 'Are you sure you want to Deallocate Case?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Save',
          handler: async () => {
            const data = {
              field_agent_id: -1
            };
            this.caseActionService.deAllocationCase(data, this.caseId).
              subscribe(async (response) => {
                // TODO
                // let cases = await this.storageService.get('cases');
                // console.log(cases);
                // cases = cases.filter((currentCase) => {
                //   if (currentCase.id === this.caseId) {
                //     return false;
                //   } else {
                //     if (currentCase.linked_cases) {
                //       currentCase.linked_cases = currentCase.linked_cases.filter(linked_case => linked_case.id !== this.caseId);
                //     }
                //     return true;
                //   }
                // });
                // this.storageService.set('cases', cases);
                // localStorage.removeItem('detais_case_data');
                // localStorage.setItem('detais_case_data_deallocated', 'true');
                this.router.navigate(['/home/job-list'], { state: { updateInfos: true } });
              });
          }
        }
      ]
    });
    await alert.present();
  }
}
