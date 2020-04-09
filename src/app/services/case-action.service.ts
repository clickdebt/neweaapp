import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CaseActionService {

  constructor(public http: HttpClient) { }

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
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/legacy/case_actions_panels/case_actions_change_status/${caseId}?source=API`;
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
  updateArrangement(data, caseId, arrangementId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/default_popup/view/case_arrangement/${caseId}/single/default/update/${arrangementId}?source=API`;
    return this.http.post(apiURL, data);
  }
  createArrangement(data, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/arrangements/case_actions_panels/edit/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }
  createPayment(data, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/payment/case_actions_panels/case_action_create_payment/${caseId}?source=API`;
    return this.http.post(apiURL, data);
  }
}
