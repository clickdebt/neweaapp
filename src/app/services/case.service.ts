import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  constructor(
    public http: HttpClient
  ) {
  }

  getCases(params) {
    let apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/visit?1=1';
    for (let key in params) {
      if (params.hasOwnProperty(key) && params[key] !== '') {
        apiURL += '&' + key + '=' + params[key];
      }
    }
    return this.http.get(apiURL);
  }

  getVisitOutcomes(caseId) {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v1/alerts/getAlertExitCodes/' + caseId;
    return this.http.get(apiURL);
  }

  getFilterMasterData() {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/filter';
    return this.http.get(apiURL);
  }
}
