import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  serverURL;
  constructor(
    public http: HttpClient
  ) {
    this.serverURL = localStorage.getItem('server_url') + 'b/system/v1/';
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
    const apiURL = this.serverURL + 'cases/visit?user_id=18&limit=20';
    const newheader = this.getHeaders();
    return this.http.get(apiURL, { headers: newheader });
  }
}
