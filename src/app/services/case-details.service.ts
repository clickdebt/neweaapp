import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CaseDetailsService {

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
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/payment/case_actions_panels/case_action_payments_table/${caseId}/successful?source=API`;
    return this.http.get(apiURL);
  }
  updateCaseMarker(col, caseId) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/case_markers/panels/update_case_marker/${caseId}/${col}?source=API`;
    return this.http.get(apiURL);
  }
}
