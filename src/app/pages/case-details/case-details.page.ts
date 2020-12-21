import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { CaseService, CommonService, DatabaseService, StorageService } from 'src/app/services';
import { CaseActionService } from 'src/app/services/case-action.service';
import { CaseDetailsService } from 'src/app/services/case-details.service';
import { NetworkService } from 'src/app/services/network.service';
import { isArray } from 'util';
import { AddFeeModalPage } from '../add-fee-modal/add-fee-modal.page';
import { AddNoteModalPage } from '../add-note-modal/add-note-modal.page';
import { ArrangementModalPage } from '../arrangement-modal/arrangement-modal.page';
import { OnHoldModalPage } from '../on-hold-modal/on-hold-modal.page';
import { PaymentModalPage } from '../payment-modal/payment-modal.page';
import { TakePaymentPage } from '../take-payment/take-payment.page';
import { UploadDocumentModalPage } from '../upload-document-modal/upload-document-modal.page';
import { VisitDetailsPage } from '../visit-details/visit-details.page';
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
  historyName;
  historyAction;
  caseDetails: any = {
    history: {},
    data: {},
    case_custom_data: {}
  };
  historyTypes = [];
  getCaseSchemeSpecificData = [];
  historyData: any[] = [];
  historyDataIndex = 10;
  searchBarValue = '';
  historyFilterData: any[] = [];
  actions: string[];
  linkedTotal = 0;
  arranagement;
  actionListArray: any = {
    'add_note': {
      text: 'Add Note',
      handler: () => {
        this.addNote();
      }
    },
    'add_fee': {
      text: 'Add Fee',
      handler: () => {
        this.addFee();
      }
    },
    'visit_case': {
      text: 'Visit Case',
      handler: () => {
        this.visitCase();
      }
    },
    'arrangement': {
      text: 'Arrangement',
      handler: () => {
        this.addArrangement();
      }
    },
    'deallocate_case': {
      text: 'Deallocate case',
      handler: () => {
        this.deallocateCase();
      }
    },
    'upload_document': {
      text: 'Upload Document',
      handler: () => {
        this.uploadDocument();
      }
    },
    'take_payment': {
      text: 'Take Payment',
      handler: () => {
        this.takePayment();
      }
    },

  };
  dataReady = false;
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
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.caseId = this.route.snapshot.params.id;
    this.fromVrmSearch = localStorage.getItem('from_vrm');
    const downloadStatus = await this.databaseService.getHistoryDownloadStatus();
    if (downloadStatus && downloadStatus.status) {
      this.dataReady = true;

      this.loadInitData();
    } else {
      this.dataReady = false;
      this.commonService.showToast('Data not downaloaded yet, please try after sometime.')
    }

    // this.actionList();
  }
  async presentActionSheet() {
    let buttons = [{
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Delete clicked');
      }
    }];
    const isNewlyn = this.commonService.isClient('newlyn');
    if (isNewlyn) {
      buttons.push(this.actionListArray['add_note']);
      buttons.push(this.actionListArray['add_fee']);

      if (this.currentCaseData.stage.stage_type.stage_type == 'Visit') {
        buttons.push(this.actionListArray['visit_case']);
      }
      if (await this.commonService.hasPermission(this.commonService.permissionSlug.AddArrangement)) {
        buttons.push(this.actionListArray['arrangement']);
      }
      if (await this.commonService.hasPermission(this.commonService.permissionSlug.DeAllocate)) {
        buttons.push(this.actionListArray['deallocate_case']);
      }
      if (await this.commonService.hasPermission(this.commonService.permissionSlug.Document)) {
        buttons.push(this.actionListArray['upload_document']);
      }
      if (1 || await this.commonService.hasPermission(this.commonService.permissionSlug.AddPayment)) {
        buttons.push(this.actionListArray['take_payment']);
      }
    } else {
      buttons.push(this.actionListArray['add_note']);
      buttons.push(this.actionListArray['add_fee']);
      buttons.push(this.actionListArray['arrangement']);
      buttons.push(this.actionListArray['deallocate_case']);
      buttons.push(this.actionListArray['upload_document']);

      if (this.currentCaseData.stage.stage_type.stage_type == 'Visit') {
        buttons.push(this.actionListArray['visit_case'])
      }

      const actionSheet = await this.actionSheetController.create({
        header: 'Actions',
        cssClass: 'my-custom-class',
        buttons: buttons
      });
      await actionSheet.present();
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
      this.getOfflinecaseDetails();

    } else {
      this.router.navigate(['/home/job-list']);
    }
    this.currentCaseData.show = false;
  }

  sum(a, b) {
    return parseFloat(a) + parseFloat(b);
  }

  async getOfflinecaseDetails() {

    const result = await this.databaseService.getOfflinecaseDetails(this.currentCaseData.id);
    console.log(result);

    this.caseDetails.history = result.history;
    let custom_data = JSON.parse(result.data.custom_data);
    let custArr: any = [];
    custom_data = Object.values(custom_data);

    custom_data.forEach(element => {
      if (!isArray(element)) {
        custArr[element.field_name] = element.field_value
      }
    });
    this.caseDetails.case_custom_data = custArr;
    this.caseDetails.data = result.data;

    this.getCaseSchemeSpecificData = [
      { 'label': 'Offence Description', 'value': result.data.offense },
      { 'label': 'Offence Time', 'value': custArr.offense_time },
      { 'label': 'Offence Date', 'value': result.data.offense_date },
      { 'label': 'Offence Code', 'value': custArr.offense_code },
      { 'label': 'Offence Location', 'value': result.data.offense_add1 },
      { 'label': 'Offence Address Line2', 'value': result.data.offense_add2 },
      { 'label': 'Offence Address Line 3', 'value': result.data.offense_add3 },
      { 'label': 'Offence Line 4', 'value': result.data.offense_add4 },
      { 'label': 'Offense Postcode', 'value': result.data.offense_postcode },
    ]
    this.caseDetails.history.sort((a, b) => {
      if (new Date(a.time) > new Date(b.time)) {
        return -1;
      } else if (new Date(a.time) < new Date(b.time)) {
        return 1;
      }
      return 0;
    });
    this.historyData = this.caseDetails.history;
    let actionArr = this.historyData.map(x => x.type)
    this.historyTypes = [...new Set(actionArr)];

    this.historyFilterData = this.historyData.slice(0, this.historyDataIndex);
    console.log(this.caseDetails);

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


  loadData(infiniteScrollEvent) {
    this.historyFilterData = this.historyFilterData.concat(this.historyData.slice(this.historyDataIndex, this.historyDataIndex + 10));
    this.historyDataIndex += 10;
    infiniteScrollEvent.target.complete();
  }

  async filterHistory() {
    this.historyDataIndex = 10;

    let query = `select * from history  where caseid = ${this.caseId}`;
    if (this.historyAction.length) {
      let actions: any = [];
      this.historyAction.forEach(element => {
        actions.push("'" + element + "'");

      });
      actions = actions.join(',');
      query += ` and type in (${actions})`;
    }
    if (this.historyName) {
      query += ` and (note like '%${this.historyName}%' or  name like '%${this.historyName}%')`;
    }
    query += 'order by id desc';
    console.log(query);

    let result = await this.databaseService.executeQuery(query);
    let finalResult = await this.databaseService.extractResult(result);
    this.historyData = finalResult;
    this.historyFilterData = this.historyData.slice(0, this.historyDataIndex);
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
            // if (this.networkService.getCurrentNetworkStatus() == 1) {
            //   this.caseActionService.deAllocationCase(data, this.caseId).
            //     subscribe(async (response) => {
            //       this.storageService.set('is_case_updated', true);
            //       // TODO
            //       // let cases = await this.storageService.get('cases');
            //       // console.log(cases);
            //       // cases = cases.filter((currentCase) => {
            //       //   if (currentCase.id === this.caseId) {
            //       //     return false;
            //       //   } else {
            //       //     if (currentCase.linked_cases) {
            //       //       currentCase.linked_cases = currentCase.linked_cases.filter(linked_case => linked_case.id !== this.caseId);
            //       //     }
            //       //     return true;
            //       //   }
            //       // });
            //       // this.storageService.set('cases', cases);
            //       // localStorage.removeItem('detais_case_data');
            //       // localStorage.setItem('detais_case_data_deallocated', 'true');
            //       this.router.navigate(['/home/job-list'], { state: { updateInfos: true } });
            //     });
            // } else {
            const api_data = [
              { name: 'case_id', value: `${this.caseId}` },
              { name: 'url', value: `b/clickdebt_panel_layout/legacy/case_actions_panels/case_actions_change_field_agent/${this.caseId}?source=API` },
              { name: 'type', value: `post` },
              { name: 'data', value: `${encodeURI(JSON.stringify(data))}` },
              { name: 'is_sync', value: 0 },
              { name: 'created_at', value: `${moment().format('YYYY-MM-DD hh:mm:ss')}` },
            ]
            this.caseActionService.saveActionOffline('api_calls', api_data);

            this.storageService.set('is_case_updated', true);
            this.router.navigate(['/home/job-list'], { state: { updateInfos: true } });
          }

        }
        // }
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
        currentCase: this.currentCaseData,
        arranagement: this.arranagement
      }
    });
    await AddArrangementModal.present();
  }
  async visitCase() {
    localStorage.setItem('visit_case_data', JSON.stringify(this.currentCaseData));
    this.storageService.set('caseId', this.currentCaseData.id);
    this.router.navigate([`/home/visit-form/${this.caseId}`]);
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

  doRefresh(event) {
    if (this.networkService.getCurrentNetworkStatus() === 1) {
      this.caseService.getCaseDetailById(this.caseId).subscribe((data) => {
        this.databaseService.setcaseDetails(data).then(() => {
          this.loadInitData();
          event.target.complete();
        })
      });
    } else {
      event.target.complete();
    }
  }

  ionViewWillLeave() {
    localStorage.removeItem('from_vrm');
    this.storageService.remove('caseId');
  }
}
