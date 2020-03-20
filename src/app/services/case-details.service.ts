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
}
