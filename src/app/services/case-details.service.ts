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
<<<<<<< HEAD
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/payment/case_actions_panels/case_action_payments_table/${caseId}/successful?source=API`;
=======
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/payment/case_actions_panels/case_action_payments_group/${caseId}/successful?source=API`;
>>>>>>> 6c86ad277bd4f2734db4fa16d683711113d2c9e7
    return this.http.get(apiURL);
  }
  updateCaseMarker(col, caseId, addMarkerForLinkedCases) {
    const apiURL = localStorage.getItem('server_url') + `b/clickdebt_panel_layout/case_markers/panels/update_case_marker/${caseId}/${col}/${addMarkerForLinkedCases}?source=API`;
    return this.http.get(apiURL);
  }
}
