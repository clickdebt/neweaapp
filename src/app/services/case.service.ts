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

  getHeaders() {
    const header = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const token = localStorage.getItem('remote_token');
    const headers = new HttpHeaders(header);
    if (token !== undefined) {
      const newheader = headers.append('Authorisation', token);
      return newheader;
    } else {
      return headers;
    }

  }
  getCases(params) {
    const logindata = JSON.parse(localStorage.getItem('userdata'));
    // tslint:disable-next-line: max-line-length
    const apiURL = localStorage.getItem('server_url') + 'b/system/v1/cases/visit?user_id=' + logindata.id + '&limit=' + params.limit + '&page=' + params.page;
    const newheader = this.getHeaders();
    return this.http.get(apiURL);
  }
}
