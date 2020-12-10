import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { StorageService } from './storage.service';
import { forkJoin } from 'rxjs';
import { DatabaseService } from './database.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CaseActionService {
  // tslint:disable: max-line-length
  constructor(
    public http: HttpClient,
    private storageService: StorageService,
    private commonService: CommonService,
    private databaseService: DatabaseService
  ) { }

  getFeeOptions(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/financial/case_actions_panels/case_action_fee_options/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  addFee(data, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/financial/case_actions_panels/case_action_add_fee/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }
  getFeeActions(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/financial/case_actions_panels/case_action_fees_table/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  deleteFeeAction(feeActionId, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/financial/case_actions_panels/case_action_remove_fee/${feeActionId}/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  saveNoteData(data, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/history/panels/add_case_note/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }
  saveVulnerableMarker(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/case_markers/panels/update_case_marker/${caseId}/field?source=API`;
    return this.http.get(apiURL);
  }
  saveOnHoldStatus(data, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/case_markers/panels/put_on_hold/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }
  removeHoldStatus(data, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/case_markers/panels/hold_summary/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }
  deAllocationCase(data, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/legacy/case_actions_panels/case_actions_change_field_agent/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }
  getActiveArrangements(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/arrangements/case_actions_panels/info/${caseId}/single?source=API`;
    return this.http.get(apiURL);
  }
  getInactiveArrangements(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/arrangements/case_actions_panels/inactive/${caseId}/single/default/?source=API`;
    return this.http.get(apiURL);
  }
  updateArrangement(data, caseId, arrangementId, type = 'single') {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/arrangements/case_actions_panels/update/${caseId}/${type}/default/0/update/${arrangementId}?source=API`;
    return this.http.post(apiURL, data);
  }
  createArrangement(data, caseId, type = 'edit') {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/arrangements/case_actions_panels/${type}/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }
  createPayment(data, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/payment/case_actions_panels/case_action_create_payment/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }

  getCaseDocuments(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_ajax_layout/legacy/panels/case_documents_mini/${caseId}?source=API`;
    return this.http.get(apiURL);
  }

  uploadDocument(file, caseId) {
    let formData = new FormData();
    formData.append('file', file);
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_ajax_layout/legacy/panels/upload_case_documents/${caseId}?source=API`;
    return this.http.post(apiURL, formData);
  }

  selfCaseAllocate(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/system/v3/cases/self_case_allocate/${caseId}?source=API`;
    return this.http.get(apiURL);
  }

  takePayment(data) {
    const apiURL = localStorage.getItem('server_url') + `b/payment/sage_pay_actions/take_app_payment?source=API`;
    return this.http.post(apiURL, data);
  }
  // addPayment(data, caseId) {
  //   const apiURL = localStorage.getItem('server_url') + 'b/payment/sage_pay_actions/create_payment/' + caseId + '/0?source=API';
  //   return this.http.post(apiURL, data);
  // }
  authorizeCard(data) {
    const apiURL = localStorage.getItem('server_url') + 'b/payment/sage_pay_actions/identify_card?source=API';
    return this.http.post(apiURL, data);
  }
  saveCardDetails(data) {
    const apiURL = localStorage.getItem('server_url') + 'b/payment/sage_pay_actions/save_card_identifier?source=API';
    return this.http.post(apiURL, data);
  }
  getSavedCards(debtorId, gateway, type) {
    const apiURL = localStorage.getItem('server_url') + `b/payment/sage_pay_actions/get_card_list/${debtorId}/${gateway}/${type}?source=API`;
    return this.http.get(apiURL);
  }

  async offlineActions() {
    // const caseDetailsActions = await this.storageService.get('case_details_action');
    // const requests = [];
    // caseDetailsActions.forEach((caseDerailsAction) => {
    //   requests.push(this.http.request(caseDerailsAction.type, localStorage.getItem('server_url') + `b/clickdebt_panel_layout/` + caseDerailsAction.url, caseDerailsAction.data));
    // });

    // forkJoin(requests).subscribe(data => {
    //   console.log(data);
    //   this.storageService.set('case_details_action', []);
    // });
  }

  saveActionOffline(table, data) {

    // this.storageService.get('case_details_action').then((caseDetailsActions) => {
    //   if (!caseDetailsActions) {
    //     caseDetailsActions = [];
    //   }
      // const req = [
      //   { name: 'case_id', value: `'${case_id}'` },
      //   { name: 'url', value: `'${url}'` },
      //   { name: 'type', value: `'${type}'` },
      //   { name: 'data', value: `'${encodeURI(JSON.stringify(data))}'` },
      //   { name: 'is_sync', value: 0 },
      //   { name: 'created_at', value: `'${moment().format('YYYY-MM-DD hh:mm:ss')}'` },
      // ];

      // caseDetailsActions.push(req);
      // this.storageService.set('case_details_action', caseDetailsActions);
      // this.commonService.showToast('Your Response is Saved will affect when you come online', 'success');
      this.databaseService.insert(table, data).then(async (data) => {
        // await this.storageService.set('isVisitFormSync', false);
        this.databaseService.changeIsApiPending(true);
        this.commonService.showToast('Data Saved Locally.');
      }, (error) => {
      // });
    });
  }
}
