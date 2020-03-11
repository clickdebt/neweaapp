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
    const logindata = JSON.parse(localStorage.getItem('userdata'));
    // tslint:disable-next-line: max-line-length
    const apiURL = localStorage.getItem('server_url') + 'b/system/v1/cases/visit?user_id=' + logindata.id + '&limit=' + params.limit + '&page=' + params.page;
    return this.http.get(apiURL);
  }

  getFilters() {
    const apiURL = localStorage.getItem('server_url') + 'b/system/v3/cases/filter';
    return this.http.get(apiURL);
  }
}
