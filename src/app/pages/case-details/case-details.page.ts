import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService, CommonService, CaseService, DatabaseService } from 'src/app/services';
import { CaseDetailsService } from 'src/app/services/case-details.service';
import { ModalController, AlertController, NavController } from '@ionic/angular';
import { AddNoteModalPage } from '../add-note-modal/add-note-modal.page';
import { OnHoldModalPage } from '../on-hold-modal/on-hold-modal.page';
import { AddFeeModalPage } from '../add-fee-modal/add-fee-modal.page';
import { CaseActionService } from 'src/app/services/case-action.service';
import { PaymentModalPage } from '../payment-modal/payment-modal.page';
import { ArrangementModalPage } from '../arrangement-modal/arrangement-modal.page';
import { UploadDocumentModalPage } from '../upload-document-modal/upload-document-modal.page';
import { TakePaymentPage } from '../take-payment/take-payment.page';
import { VisitDetailsPage } from '../visit-details/visit-details.page';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.page.html',
  styleUrls: ['./case-details.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CaseDetailsPage implements OnInit {
  caseId;
  fromVrmSearch: any = false;
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
    },
    documents: {
      show: false
    }
  };
  getCaseSchemeSpecificDetail = false;
  getCaseSchemeSpecificData = [];
  historyData: any[] = [];
  historyDataIndex = 10;
  searchBarValue = '';
  historyFilterData: any[] = [];
  actions: string[];
  SelectedAction = '';
  caseDocuments = [];
  linkedTotal = 0;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private caseDetailsService: CaseDetailsService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private caseActionService: CaseActionService,
    private commonService: CommonService,
    private navCtrl: NavController,
    private caseService: CaseService,
    private modalController: ModalController,
    private databaseService: DatabaseService,
    private networkService: NetworkService,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.caseId = this.route.snapshot.params.id;
    this.fromVrmSearch = localStorage.getItem('from_vrm');
    this.loadInitData();
    this.actionList();
  }

  async actionList() {
    const isNewlyn = this.commonService.isClient('newlyn');
    if (isNewlyn) {
      this.actions = ['Add Note', 'Add Fee'];
      if (this.currentCaseData.stage.stage_type.stage_type == 'Visit') {
        this.actions.push('Visit Case');
      }
      if (await this.commonService.hasPermission(this.commonService.permissionSlug.AddArrangement)) {
        this.actions.push('Arrangement');
      }
      if (await this.commonService.hasPermission(this.commonService.permissionSlug.DeAllocate)) {
        this.actions.push('Deallocate case');
      }
      if (await this.commonService.hasPermission(this.commonService.permissionSlug.Document)) {
        this.actions.push('Upload Document');
      }
      // if (await this.commonService.hasPermission(this.commonService.permissionSlug.AddPayment)) {
      //   this.actions.push('Add Payment');
      // }
      if (1 || await this.commonService.hasPermission(this.commonService.permissionSlug.AddPayment)) {
        this.actions.push('Take Payment');
      }
    } else {
      this.actions = ['Add Note', 'Add Fee', 'Deallocate case'
        , 'Arrangement', 'Upload Document'];
      if (this.currentCaseData.stage.stage_type.stage_type == 'Visit') {
        this.actions.push('Visit Case');
      }
    }
  }
  async loadInitData() {

    if (localStorage.getItem('detais_case_data')) {
      this.currentCaseData = JSON.parse(localStorage.getItem('detais_case_data'));
      if (this.currentCaseData.linked_cases && this.currentCaseData.linked_cases.length) {
        const linkedCasesTotalBalance = parseFloat(this.currentCaseData.d_outstanding)
          + this.currentCaseData.linked_cases.reduce((accumulator, currentValue) => {
            return accumulator + parseFloat(currentValue.d_outstanding);
          }, 0);
        this.linkedTotal = linkedCasesTotalBalance;
      }
      // this.getOfflinecaseDetails();
      this.getCaseMarkers();
      this.getSummary();
      this.getClient();
      this.getfinancialDetails();
      this.getCaseDetails();
      this.getCaseSchemeSpecificDetails();
      this.getHistory();
      this.getPayments();
      this.getCaseDocuments();

    } else {
      this.router.navigate(['/home/job-list']);
    }
    this.currentCaseData.show = false;
  }

  async getOfflinecaseDetails() {

    const result = await this.databaseService.getOfflinecaseDetails(this.currentCaseData.id);
    console.log(result);

    this.caseDetails.caseMarkers.fields = result.caseMarkers;
    this.caseDetails.caseSummary = result.case_Summary;
    this.caseDetails.financialDetails = result.Financials;
    this.caseDetails.payments.paymentData = result.paymentData;
    this.caseDetails.history = result.history;
    this.caseDocuments = result.caseDocuments;
    this.getCaseSchemeSpecificDetail = true;
    this.getCaseSchemeSpecificData = result.case_details;

    this.caseDetails.payments.paymentData.sort((a, b) => {
      if (new Date(a.date) > new Date(b.date)) {
        return -1;
      } else if (new Date(a.date) < new Date(b.date)) {
        return 1;
      }
      return 0;
    });

    this.caseDetails.history.sort((a, b) => {
      if (new Date(a.time) > new Date(b.time)) {
        return -1;
      } else if (new Date(a.time) < new Date(b.time)) {
        return 1;
      }
      return 0;
    });
    this.historyData = this.caseDetails.history;
    this.historyFilterData = this.historyData.slice(0, this.historyDataIndex);
  }

  onSelectChange(event) {
    if (this.SelectedAction === 'Add Note') {
      this.addNote();
    } else if (this.SelectedAction === 'Deallocate case') {
      this.deallocateCase();
    } else if (this.SelectedAction === 'Add Fee') {
      this.addFee();
    } else if (this.SelectedAction === 'Add Payment') {
      this.addPayment();
    } else if (this.SelectedAction === 'Take Payment') {
      this.takePayment();
    } else if (this.SelectedAction === 'Arrangement') {
      this.addArrangement();
    } else if (this.SelectedAction === 'Upload Document') {
      this.uploadDocument();
    } else if (this.SelectedAction === 'Visit Case') {
      localStorage.setItem('visit_case_data', JSON.stringify(this.currentCaseData));
      this.storageService.set('caseId', this.currentCaseData.id);
      this.router.navigate([`/home/visit-form/${this.caseId}`]);
    }
    this.SelectedAction = '';
  }

  toggleShow(object) {
    object.show = !object.show;
  }

  isShown(object) {
    return object.show;
  }
  async showVisitDetails(history) {
    const modal = await this.modalController.create({
      component: VisitDetailsPage, componentProps: {
        cssClass: 'case-action-modal',
        visitId: history.document_id
      }
    });
    return await modal.present();
  }
  getCaseMarkers() {
    this.caseDetailsService.getCaseMarkers(this.caseId).subscribe((response: any) => {
      this.caseDetails.caseMarkers.fields = response.data.fields;
    });
  }
  async onCaseMarkerClick(caseMarker) {
    if (caseMarker.shortcode === 'hold') {
      this.onHold(caseMarker);
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Update a CaseMarker',
        message: `Are you sure you want to change <strong>${caseMarker.label}</strong> marker?`,
        inputs: [
          {
            name: 'linked_cases',
            type: 'checkbox',
            value: 'linked_cases',
            label: 'Add for linked cases?'
          }
        ],
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: 'Yes',
            handler: data => {
              let linked = [];
              if (data.length > 0 && data[0] === 'linked_cases') {
                linked = this.currentCaseData.linked_cases.map(ca => ca.id);
              }
              if (this.networkService.getCurrentNetworkStatus() == 1) {
                this.caseDetailsService.updateCaseMarker(caseMarker.col, this.caseId, linked)
                  .subscribe((response) => {
                    this.getCaseMarkers();
                  });
              } else {
                this.caseActionService.saveActionOffline(
                  `b/clickdebt_panel_layout/case_markers/panels/update_case_marker/${this.caseId}/${caseMarker.col}?source=API`,
                  'post',
                  { 'linked': linked }
                );
              }
            }
          }
        ]
      });
      await alert.present();
    }



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
  getCaseSchemeSpecificDetails() {
    this.caseDetailsService.getSchemeSpecificDetails(this.caseId).subscribe((response: any) => {
      if (response && response.prepare_array) {
        this.getCaseSchemeSpecificDetail = true;
        this.getCaseSchemeSpecificData = response.prepare_array;
      }
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
    });
  }
  getCaseDocuments() {
    this.caseActionService.getCaseDocuments(this.caseId).subscribe((response: any) => {
      if (response) {
        this.caseDocuments = Object.values(response.documents);
      }
    });
  }

  async addNote() {
    const AddNoteModal = await this.modalCtrl.create({
      component: AddNoteModalPage,
      componentProps: {
        caseId: this.caseId,
        currentCase: this.currentCaseData
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

  async onHold(caseMarker) {
    const onHoldModal = await this.modalCtrl.create({
      component: OnHoldModalPage,
      componentProps: {
        caseId: this.caseId,
        // tslint:disable-next-line: object-literal-shorthand
        caseMarker: caseMarker,
        case: this.currentCaseData
      }
    });
    onHoldModal.onDidDismiss().then(async (response) => {
      if (response.data && response.data.saved) {
        this.getCaseMarkers();
        this.storageService.set('is_case_updated', true);
      }
    });
    await onHoldModal.present();
  }
  async addFee() {
    const AddFeeModal = await this.modalCtrl.create({
      component: AddFeeModalPage,
      componentProps: {
        caseId: this.caseId,
        currentCase: this.currentCaseData
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
            if (this.networkService.getCurrentNetworkStatus() == 1) {
              this.caseActionService.deAllocationCase(data, this.caseId).
                subscribe(async (response) => {
                  this.storageService.set('is_case_updated', true);
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
            } else {
              await this.caseActionService.saveActionOffline(
                `b/clickdebt_panel_layout/legacy/case_actions_panels/case_actions_change_field_agent/${this.caseId}?source=API`,
                'post',
                data
              );
              this.storageService.set('is_case_updated', true);
              this.router.navigate(['/home/job-list'], { state: { updateInfos: true } });
            }

          }
        }
      ]
    });
    await alert.present();
  }
  async addPayment() {
    const AddPaymentModal = await this.modalCtrl.create({
      component: PaymentModalPage,
      componentProps: {
        caseId: this.caseId,
        isDetailsPage: true
      }
    });

    await AddPaymentModal.present();
  }
  async takePayment() {
    const takePaymentModal = await this.modalCtrl.create({
      component: TakePaymentPage,
      componentProps: {
        caseId: this.caseId,
        debtorId: this.currentCaseData.debtorid,
        isDetailsPage: true
      }
    });

    await takePaymentModal.present();
  }
  async addArrangement() {
    const AddArrangementModal = await this.modalCtrl.create({
      component: ArrangementModalPage,
      componentProps: {
        caseId: this.caseId,
        d_outstanding: this.currentCaseData.d_outstanding,
        isDetailsPage: true,
        currentCase: this.currentCaseData
      }
    });
    await AddArrangementModal.present();
  }
  async uploadDocument() {
    const uploadDocument = await this.modalCtrl.create({
      component: UploadDocumentModalPage,
      componentProps: {
        caseId: this.caseId,
      }
    });
    await uploadDocument.present();
  }
  async goBack() {
    if (this.storageService.get('from_map_page')) {
      this.storageService.set('not_reload_map', true);
      this.storageService.remove('from_map_page');
    }
    this.navCtrl.back();
  }

  ionViewWillLeave() {
    localStorage.removeItem('from_vrm');
    this.storageService.remove('caseId');
  }
}
