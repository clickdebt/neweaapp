import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CaseDetailsService {
  // tslint:disable: max-line-length
  constructor(
    public http: HttpClient
  ) { }

  getCaseMarkers(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/case_markers/panels/case_summary/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  getSummary(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/legacy/panels/case_page_summary/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  getClient(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/legacy/panels/case_page_client/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  getfinancialSummary(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/legacy/panels/case_page_financial_summary/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  getCaseDetails(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/legacy/panels/case_page_case_details/${caseId}/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  getHistory(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/history/panels/case_summary/${caseId}?source=API`;
    return this.http.get(apiURL);
  }
  getPayments(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/payment/case_actions_panels/case_action_payments_group/${caseId}/successful?source=API`;
    return this.http.get(apiURL);
  }
  updateCaseMarker(col, caseId, linked) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/case_markers/panels/update_case_marker/${caseId}/${col}?source=API`;
    return this.http.post(apiURL, { 'linked': linked });
  }
  getSchemeSpecificDetails(caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/custom/panels/important_panel/${caseId}/0/app_scheme_case_info/scheme_panel?source=API`;
    return this.http.get(apiURL);
  }
  getDebtordata(caseId, debtorId) {
    const apiURL = localStorage.getItem('server_url') + 'b/clickdebt_panel_layout/legacy/debtor_panels/manage_debtor_addresses/' + debtorId + '/' + caseId + '?source=API';
    return this.http.get(apiURL);
  }
  getDvlaEnquires(vrm) {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/get_dvla_enquiries/' + vrm + '?source=API';
    return this.http.get(apiURL);
  }
  getDvlaDetails(caseId, id) {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/get_dvla_details?case_id=' + 3829 + '&dvla_id=' + 44 + '&source=API';
    return this.http.get(apiURL);
  }
}
