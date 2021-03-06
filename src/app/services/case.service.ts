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

  getCases(params, download = 0) {
    let apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/visit?1=1';
    for (let key in params) {
      if (params.hasOwnProperty(key) && params[key] !== '') {
        apiURL += '&' + key + '=' + params[key];
      }
    }
    if (download) {
      apiURL += '&downaloading=1';
    }
    return this.http.get(apiURL);
  }

  getVisitOutcomes(caseId) {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v1/alerts/getAlertExitCodes/' + caseId;
    return this.http.get(apiURL);
  }

  getCaseDetails(page) {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/getCaseDetailsData?1=1&limit=50&page=' + page;
    return this.http.get(apiURL);
  }
  getCaseDetailById(caseId) {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/getCaseDetailsData?1=1&case_id=' + caseId;
    return this.http.get(apiURL);
  }
  getFilterMasterData() {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/filter';
    return this.http.get(apiURL);
  }

  getFilters() {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/filter';
    return this.http.get(apiURL);
  }

  getVisitReports(params) {
    let apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/visit_reports?1=1';
    for (let key in params) {
      if (params.hasOwnProperty(key) && params[key] !== '') {
        apiURL += '&' + key + '=' + params[key];
      }
    }
    return this.http.get(apiURL);
  }

  geoCodeAddress(location) {
    if (location != 'undefined') {
      const apiURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=AIzaSyB2SD46TH6aRspJzp_jvIBFTFv-AlN_mUQ';
      return this.http.get(apiURL);
    }
  }
  getCaseSettings() {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/app_config/get_config/1';
    return this.http.get(apiURL);
  }
}
